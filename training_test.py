# training_backend.py
# Backend microservice for training ML models on synthetic LOMN dataset
# Project: Social Transparency & Letter of Medical Necessity (LOMN) with RAG & MI

from fastapi import FastAPI, BackgroundTasks
import uvicorn
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from datasets import load_dataset

# Instantiate FastAPI application
# This service exposes an endpoint to asynchronously start model training
app = FastAPI(
    title="LOMN Training Service",
    description=(
        "Provides endpoints to trigger training of sequence-classification "
        "models on synthetic Letters of Medical Necessity (LOMN) data."
    ),
    version="0.1.0"
)


def train_model():
    """
    Fine-tunes a pre-trained BERT model to classify LOMN texts.

    Workflow:
      1. Load synthetic dataset: JSONL files with 'text' & 'label' fields.
         - 'text': raw letter content
         - 'label': 0 (denial) or 1 (medical necessity)
      2. Tokenize each example into BERT-compatible input:
         - truncate to 512 tokens, pad shorter sequences
      3. Initialize BERT sequence-classification head for binary labels.
      4. Configure training hyperparameters:
         - epochs, batch sizes, evaluation & logging steps, checkpointing.
      5. Use Hugging Face Trainer to:
         - Train on the 'train' split
         - Evaluate on 'validation' split at regular intervals
         - Automatically save best checkpoint by accuracy
      6. Save the final model for further use (e.g., RAG integration)

    Future extensions:
      - Integrate custom 'compute_metrics' for MI-based bias analysis
      - Swap in RAG models for generative interpretability
      - Add callbacks to log to MLflow or Weights & Biases
    """
    # -----------------------
    # 1. Load dataset
    # -----------------------
    data_files = {
        "train": "data/lomn_train.jsonl",
        "validation": "data/lomn_val.jsonl"
    }
    # load_dataset handles JSONL and returns a DatasetDict
    dataset = load_dataset("json", data_files=data_files)

    # -----------------------
    # 2. Tokenization
    # -----------------------
    # Pre-trained BERT tokenizer maps text to input IDs + attention masks
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

    def tokenize_fn(example):
        # Convert raw text to fixed-length token sequence
        return tokenizer(
            example["text"],
            truncation=True,
            padding="max_length",
            max_length=512
        )

    # Apply tokenization across the dataset in batches for efficiency
    tokenized = dataset.map(tokenize_fn, batched=True)

    # -----------------------
    # 3. Model Initialization
    # -----------------------
    # Load BERT with a classification head (2 output logits)
    model = AutoModelForSequenceClassification.from_pretrained(
        "bert-base-uncased",
        num_labels=2  # 0=denial, 1=medical necessity
    )

    # -----------------------
    # 4. Training Configuration
    # -----------------------
    training_args = TrainingArguments(
        output_dir="output/",              # directory for model checkpoints
        num_train_epochs=4,                  # moderate number of epochs
        per_device_train_batch_size=16,      # batch size per GPU/CPU
        per_device_eval_batch_size=16,
        evaluation_strategy="steps",       # run validation every `eval_steps`
        eval_steps=250,                      # evaluate 4 times per epoch
        logging_steps=100,                   # log training metrics every 100 steps
        save_steps=250,                      # checkpoint every 250 steps
        load_best_model_at_end=True,         # restore best checkpoint after training
        metric_for_best_model="accuracy",  # choose best by validation accuracy
        greater_is_better=True,
        logging_dir="logs/"                 # TensorBoard or wandb logs
    )

    # -----------------------
    # 5. Trainer Initialization & Execution
    # -----------------------
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        tokenizer=tokenizer
        # Future: add compute_metrics function for MI/bias tracking
    )

    # Launch the training loop (blocking)
    trainer.train()

    # Save the final model artifact for inference or RAG pipelines
    trainer.save_model("output/lomn_classifier")
    print("[train_model] Completed training; model saved to output/lomn_classifier.")


@app.post("/train")
async def trigger_training(background_tasks: BackgroundTasks):
    """
    HTTP endpoint: POST /train

    Adds `train_model` to FastAPI background tasks queue.
    Returns immediately, while training runs asynchronously.
    """
    # Schedule the training job without blocking the request
    background_tasks.add_task(train_model)
    return {"status": "LOMN model training started"}


if __name__ == "__main__":
    # Entry point: run Uvicorn server hosting this app
    # `reload=True` activates auto-reload on code changes (dev only)
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )

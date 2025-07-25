# training_backend.py
# Backend service for training AI/ML models on the synthetic LOMN dataset
# Project: Social Transparency & Letter of Medical Necessity (LOMN) analysis with RAG & MI

from fastapi import FastAPI, BackgroundTasks
import uvicorn
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from datasets import load_dataset

app = FastAPI(
    title="LOMN Training Service",
    description="API to trigger training of sequence-classification models on synthetic LOMN data",
    version="0.1.0"
)


def train_model():
    """
    Core training routine for fine-tuning a BERT-based classifier on synthetic LOMN examples.
    Steps:
      1. Load JSONL data (each record has 'text' and 'label', where label indicates necessity or denial category).
      2. Tokenize text to BERT input format with padding/truncation.
      3. Initialize model for sequence classification.
      4. Configure training hyperparameters and evaluation strategy.
      5. Launch Hugging Face Trainer to train & evaluate, then save the best model.
      6. (Optional) Later: integrate RAG retriever or MI bias-analysis callback.
    """
    # 1. Load synthetic LOMN dataset from disk
    data_files = {
        "train": "data/lomn_train.jsonl",
        "validation": "data/lomn_val.jsonl"
    }
    dataset = load_dataset("json", data_files=data_files)

    # 2. Prepare tokenizer and batch-tokenize examples
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

    def tokenize_fn(example):
        # Truncate to max length and pad sequences
        return tokenizer(
            example["text"],
            truncation=True,
            padding="max_length",
            max_length=512
        )

    tokenized = dataset.map(tokenize_fn, batched=True)

    # 3. Load pre-trained BERT for binary classification (necessity vs. denial analysis)
    model = AutoModelForSequenceClassification.from_pretrained(
        "bert-base-uncased",
        num_labels=2  # 0=denial, 1=medical necessity
    )

    # 4. Define training arguments tailored for project
    training_args = TrainingArguments(
        output_dir="output/",              # checkpoint + final model output
        num_train_epochs=4,                  # small dataset; moderate epochs
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        evaluation_strategy="steps",       # run eval every `eval_steps`
        eval_steps=250,
        logging_steps=100,
        save_steps=250,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        greater_is_better=True,
        logging_dir="logs/"
    )

    # 5. Initialize Trainer and start training
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        tokenizer=tokenizer
        # future: add compute_metrics fn for MI insights
    )

    # Launch training loop
    trainer.train()

    # Save final model for inference or RAG integration
    trainer.save_model("output/lomn_classifier")
    print("Training complete. Model saved to output/lomn_classifier.")


@app.post("/train")
async def trigger_training(background_tasks: BackgroundTasks):
    """
    Endpoint to trigger the `train_model` task asynchronously.
    Returns immediately while training runs in background.
    """
    background_tasks.add_task(train_model)
    return {"status": "LOMN model training started"}


if __name__ == "__main__":
    # Run the API on port 8000; use --reload during development
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


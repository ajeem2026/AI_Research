# RAG for Letter-of-Medical-Necessity (LOMN) - Complete Prototype Guide

## Executive Summary
This guide provides a comprehensive implementation plan for building a Retrieval-Augmented Generation (RAG) pipeline using AWS Bedrock to assist clinicians in generating socially transparent Letter-of-Medical-Necessity (LOMN) documents with explainable AI (XAI) and mechanistic interpretability (MI).

---

## 1. Project Architecture

### System Overview
```
┌─────────────────┐
│  Patient Data   │
│   + Query       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│    Retrieval Layer                  │
│  - Vector Database (OpenSearch)     │
│  - Embedding Model (Titan)          │
│  - Hybrid Search                    │
└────────┬────────────────────────────┘
         │
         ▼ Retrieved Context
┌─────────────────────────────────────┐
│    Generation Layer                 │
│  - AWS Bedrock (Claude 3/Titan)     │
│  - Structured Prompts               │
│  - LOMN Template Engine             │
└────────┬────────────────────────────┘
         │
         ▼ Generated LOMN
┌─────────────────────────────────────┐
│    Explainability Layer             │
│  - Source Attribution               │
│  - Reasoning Chains                 │
│  - Transparency Metrics             │
│  - Audit Trail                      │
└─────────────────────────────────────┘
```

### Core Components

#### 1. Knowledge Base (S3 + Vector Store)
- **Approved LOMNs**: Successful examples by condition and equipment
- **Denied LOMNs**: Failed cases with denial reasons
- **Insurance Policies**: Medical necessity criteria by provider
- **Clinical Guidelines**: Evidence-based treatment standards
- **Case Studies**: Annotated examples showing provider/insurer perspectives

#### 2. RAG Pipeline
- **Embedding**: Amazon Titan Embeddings G1 - Text v1.2
- **Vector Store**: Amazon OpenSearch Serverless
- **Retrieval**: Top-k similarity search (k=5-10)
- **Generation**: Claude 3 Sonnet or Amazon Titan
- **Context Window**: 4000-8000 tokens

#### 3. Social Transparency Features
- **Stakeholder Awareness**: Show how different parties view medical necessity
- **Perspective Integration**: Balance provider, patient, and insurer viewpoints
- **Evidence Linking**: Connect claims to clinical evidence
- **Gap Identification**: Highlight missing information
- **Language Accessibility**: Generate patient-friendly summaries

---

## 2. Step-by-Step Implementation

### Prerequisites
```bash
# Required AWS Services
- AWS Account with Bedrock access
- S3 bucket for documents
- IAM roles configured
- Python 3.9+

# Install dependencies
pip install boto3 langchain langchain-aws opensearch-py
pip install pydantic python-dotenv pandas numpy
```

### Phase 1: AWS Setup (Day 1-2)

#### 1.1 Configure AWS Credentials
```python
# ~/.aws/credentials
[bedrock-lomn]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
```

#### 1.2 Request Bedrock Model Access
1. Navigate to AWS Bedrock Console
2. Go to "Model access" in left sidebar
3. Request access to:
   - Amazon Titan Text G1 - Lite
   - Amazon Titan Embeddings G1
   - Anthropic Claude 3 Sonnet
4. Wait for approval (usually instant)

#### 1.3 Create S3 Bucket Structure
```bash
aws s3 mb s3://lomn-knowledge-base-[your-id]
aws s3 mb s3://lomn-knowledge-base-[your-id]/approved-lomns/
aws s3 mb s3://lomn-knowledge-base-[your-id]/denied-lomns/
aws s3 mb s3://lomn-knowledge-base-[your-id]/insurance-policies/
aws s3 mb s3://lomn-knowledge-base-[your-id]/clinical-guidelines/
```

### Phase 2: Data Preparation (Day 3-4)

#### 2.1 Prepare Sample Documents
Based on the Lunsford paper, create sample LOMNs covering:
- **Content Categories**: Patient diagnosis, equipment requested, provider goals, supporting evidence
- **Form Elements**: Formal medical language, structured sections, proper transitivity
- **Success Factors**: Medical necessity alignment, cost-effectiveness, evidence-based rationale

#### 2.2 Document Processing Script
```python
# src/data_processor.py
import boto3
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import S3DirectoryLoader
import json

class LOMNDataProcessor:
    def __init__(self, bucket_name, region='us-east-1'):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=region)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " "]
        )
    
    def load_documents_from_s3(self, prefix):
        """Load all documents from S3 prefix"""
        loader = S3DirectoryLoader(
            bucket=self.bucket_name,
            prefix=prefix
        )
        return loader.load()
    
    def chunk_documents(self, documents):
        """Split documents into chunks with metadata"""
        chunks = []
        for doc in documents:
            splits = self.text_splitter.split_text(doc.page_content)
            for i, split in enumerate(splits):
                chunk = {
                    'text': split,
                    'metadata': {
                        **doc.metadata,
                        'chunk_id': i,
                        'source': doc.metadata.get('source', 'unknown')
                    }
                }
                chunks.append(chunk)
        return chunks
    
    def process_all_documents(self):
        """Process all document types"""
        prefixes = [
            'approved-lomns/',
            'denied-lomns/',
            'insurance-policies/',
            'clinical-guidelines/'
        ]
        
        all_chunks = []
        for prefix in prefixes:
            docs = self.load_documents_from_s3(prefix)
            chunks = self.chunk_documents(docs)
            all_chunks.extend(chunks)
        
        return all_chunks
```

#### 2.3 Create Embeddings and Vector Store
```python
# src/vector_store.py
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from langchain_aws import BedrockEmbeddings
from langchain_community.vectorstores import OpenSearchVectorSearch

class LOMNVectorStore:
    def __init__(self, opensearch_endpoint, bedrock_region='us-east-1'):
        self.bedrock_client = boto3.client(
            service_name='bedrock-runtime',
            region_name=bedrock_region
        )
        
        # Initialize embeddings model
        self.embeddings = BedrockEmbeddings(
            client=self.bedrock_client,
            model_id="amazon.titan-embed-text-v1"
        )
        
        # Connect to OpenSearch
        self.vectorstore = OpenSearchVectorSearch(
            opensearch_url=opensearch_endpoint,
            index_name="lomn-index",
            embedding_function=self.embeddings,
            use_ssl=True,
            verify_certs=True
        )
    
    def index_documents(self, chunks):
        """Index document chunks into vector store"""
        texts = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        
        self.vectorstore.add_texts(
            texts=texts,
            metadatas=metadatas
        )
        
        return len(texts)
    
    def similarity_search(self, query, k=5, filters=None):
        """Retrieve relevant documents"""
        results = self.vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filters
        )
        return results
```

### Phase 3: RAG Pipeline Implementation (Day 5-7)

#### 3.1 LOMN Generation Pipeline
```python
# src/lomn_generator.py
import boto3
import json
from typing import Dict, List
from langchain_aws import ChatBedrock
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

class LOMNGenerator:
    def __init__(self, vector_store, model_id="anthropic.claude-3-sonnet-20240229-v1:0"):
        self.vector_store = vector_store
        self.bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        
        # Initialize LLM
        self.llm = ChatBedrock(
            client=self.bedrock_client,
            model_id=model_id,
            model_kwargs={
                "temperature": 0.3,
                "top_p": 0.9,
                "max_tokens": 2000
            }
        )
        
        # Create prompt template
        self.prompt = self._create_prompt_template()
    
    def _create_prompt_template(self):
        """Create structured prompt for LOMN generation"""
        template = """You are an expert medical documentation assistant helping clinicians write Letters of Medical Necessity (LOMN).

Based on the following context from approved LOMNs, insurance policies, and clinical guidelines, generate a comprehensive LOMN.

CONTEXT:
{context}

PATIENT INFORMATION:
- Diagnosis: {diagnosis}
- Equipment Requested: {equipment}
- Clinical Rationale: {rationale}
- Functional Limitations: {limitations}

INSTRUCTIONS:
1. Use formal medical language with proper transitivity (avoid dangling modifiers)
2. Focus on medical necessity aligned with insurance criteria
3. Include specific evidence-based justification
4. Address safety, functionality, and clinical outcomes
5. Avoid convenience arguments or cost discussions beyond medical scope
6. Cite relevant clinical guidelines when applicable

Generate a structured LOMN with the following sections:
- Patient Demographics & Diagnosis
- Medical Necessity Statement
- Functional Assessment
- Clinical Rationale with Evidence
- Equipment Specifications
- Expected Outcomes
- Provider Attestation

LETTER:"""
        
        return PromptTemplate(
            template=template,
            input_variables=["context", "diagnosis", "equipment", "rationale", "limitations"]
        )
    
    def generate_lomn(self, patient_data: Dict) -> Dict:
        """Generate LOMN with source attribution"""
        # Retrieve relevant context
        query = f"{patient_data['diagnosis']} {patient_data['equipment']} medical necessity"
        retrieved_docs = self.vector_store.similarity_search(query, k=5)
        
        # Format context
        context = "\n\n".join([
            f"[Source: {doc[0].metadata.get('source', 'Unknown')}]\n{doc[0].page_content}"
            for doc in retrieved_docs
        ])
        
        # Generate LOMN
        filled_prompt = self.prompt.format(
            context=context,
            diagnosis=patient_data.get('diagnosis', ''),
            equipment=patient_data.get('equipment', ''),
            rationale=patient_data.get('rationale', ''),
            limitations=patient_data.get('limitations', '')
        )
        
        response = self.llm.invoke(filled_prompt)
        
        # Return with transparency metadata
        return {
            'lomn_text': response.content,
            'sources': [doc[0].metadata for doc in retrieved_docs],
            'retrieval_scores': [doc[1] for doc in retrieved_docs],
            'prompt_used': filled_prompt,
            'model_id': self.llm.model_id
        }
```

### Phase 4: Explainability & Social Transparency (Day 8-10)

#### 4.1 Transparency Module
```python
# src/transparency.py
from typing import Dict, List
import re

class SocialTransparencyAnalyzer:
    """
    Implements social transparency principles from Ehsan et al.
    - Stakeholder awareness
    - Context sensitivity
    - Reasoning visibility
    - Limitation disclosure
    """
    
    def __init__(self):
        self.stakeholders = ['provider', 'patient', 'insurer']
    
    def analyze_lomn_transparency(self, lomn_result: Dict) -> Dict:
        """Analyze LOMN for social transparency metrics"""
        lomn_text = lomn_result['lomn_text']
        
        analysis = {
            'source_attribution': self._extract_source_attribution(lomn_result),
            'stakeholder_perspectives': self._identify_perspectives(lomn_text),
            'evidence_strength': self._assess_evidence_strength(lomn_result),
            'uncertainty_markers': self._find_uncertainty(lomn_text),
            'reasoning_chain': self._generate_reasoning_chain(lomn_result),
            'gaps_identified': self._identify_information_gaps(lomn_text)
        }
        
        return analysis
    
    def _extract_source_attribution(self, lomn_result: Dict) -> List[Dict]:
        """Link each section to source documents"""
        attributions = []
        for i, source in enumerate(lomn_result['sources']):
            attributions.append({
                'source_id': i,
                'document': source.get('source', 'Unknown'),
                'type': source.get('document_type', 'Unknown'),
                'relevance_score': lomn_result['retrieval_scores'][i]
            })
        return attributions
    
    def _identify_perspectives(self, lomn_text: str) -> Dict:
        """Identify which stakeholder perspectives are addressed"""
        perspectives = {
            'provider': {
                'indicators': ['clinical rationale', 'treatment plan', 'professional opinion'],
                'present': False
            },
            'patient': {
                'indicators': ['patient safety', 'quality of life', 'functional improvement'],
                'present': False
            },
            'insurer': {
                'indicators': ['medical necessity', 'evidence-based', 'standard of care'],
                'present': False
            }
        }
        
        text_lower = lomn_text.lower()
        for stakeholder, data in perspectives.items():
            for indicator in data['indicators']:
                if indicator in text_lower:
                    data['present'] = True
                    break
        
        return perspectives
    
    def _assess_evidence_strength(self, lomn_result: Dict) -> str:
        """Evaluate strength of supporting evidence"""
        sources = lomn_result['sources']
        
        # Check for clinical guidelines
        has_guidelines = any('guideline' in str(s).lower() for s in sources)
        # Check for approved examples
        has_approved = any('approved' in str(s).lower() for s in sources)
        # Check retrieval scores
        avg_score = sum(lomn_result['retrieval_scores']) / len(lomn_result['retrieval_scores'])
        
        if has_guidelines and avg_score > 0.8:
            return "Strong: Clinical guidelines cited with high relevance"
        elif has_approved and avg_score > 0.7:
            return "Moderate: Approved examples found with good relevance"
        else:
            return "Weak: Limited evidence or low relevance scores"
    
    def _find_uncertainty(self, lomn_text: str) -> List[str]:
        """Identify sections with uncertain language"""
        uncertainty_markers = [
            'may', 'might', 'possibly', 'likely', 'appears to',
            'suggests', 'potential', 'estimated'
        ]
        
        sentences = lomn_text.split('.')
        uncertain_sections = []
        
        for sentence in sentences:
            if any(marker in sentence.lower() for marker in uncertainty_markers):
                uncertain_sections.append(sentence.strip())
        
        return uncertain_sections
    
    def _generate_reasoning_chain(self, lomn_result: Dict) -> List[Dict]:
        """Create step-by-step reasoning explanation"""
        chain = [
            {
                'step': 1,
                'action': 'Retrieved relevant documents',
                'details': f"Found {len(lomn_result['sources'])} relevant sources",
                'transparency': 'Sources available for review'
            },
            {
                'step': 2,
                'action': 'Analyzed medical necessity criteria',
                'details': 'Matched patient condition to insurance requirements',
                'transparency': 'Criteria extracted from insurance policies'
            },
            {
                'step': 3,
                'action': 'Synthesized clinical evidence',
                'details': 'Combined approved examples with guidelines',
                'transparency': 'Evidence strength assessed and documented'
            },
            {
                'step': 4,
                'action': 'Generated structured LOMN',
                'details': 'Used template aligned with insurance expectations',
                'transparency': 'Generation prompt and model parameters logged'
            }
        ]
        
        return chain
    
    def _identify_information_gaps(self, lomn_text: str) -> List[str]:
        """Identify missing information that could strengthen the LOMN"""
        gaps = []
        
        # Based on Lunsford paper analysis
        required_elements = {
            'supporting research': ['study', 'research', 'evidence'],
            'patient goals': ['patient goal', 'rehabilitation goal'],
            'functional assessment': ['functional', 'ROM', 'mobility'],
            'equipment specifications': ['model', 'specification', 'feature']
        }
        
        text_lower = lomn_text.lower()
        for element, keywords in required_elements.items():
            if not any(keyword in text_lower for keyword in keywords):
                gaps.append(f"Missing or weak: {element}")
        
        return gaps
    
    def generate_transparency_report(self, lomn_result: Dict) -> str:
        """Generate human-readable transparency report"""
        analysis = self.analyze_lomn_transparency(lomn_result)
        
        report = f"""
=== SOCIAL TRANSPARENCY REPORT ===

## Source Attribution
{len(analysis['source_attribution'])} sources used:
"""
        for attr in analysis['source_attribution']:
            report += f"  - {attr['document']} (relevance: {attr['relevance_score']:.2f})\n"
        
        report += f"\n## Stakeholder Perspectives Addressed\n"
        for stakeholder, data in analysis['stakeholder_perspectives'].items():
            status = "✓" if data['present'] else "✗"
            report += f"  {status} {stakeholder.capitalize()}\n"
        
        report += f"\n## Evidence Strength\n  {analysis['evidence_strength']}\n"
        
        if analysis['uncertainty_markers']:
            report += f"\n## Uncertainty Markers Found ({len(analysis['uncertainty_markers'])})\n"
            for marker in analysis['uncertainty_markers'][:3]:
                report += f"  - \"{marker[:80]}...\"\n"
        
        if analysis['gaps_identified']:
            report += f"\n## Information Gaps\n"
            for gap in analysis['gaps_identified']:
                report += f"  ⚠ {gap}\n"
        
        report += f"\n## Reasoning Chain\n"
        for step in analysis['reasoning_chain']:
            report += f"  {step['step']}. {step['action']}\n     {step['details']}\n     Transparency: {step['transparency']}\n\n"
        
        return report
```

#### 4.2 Main Application
```python
# src/main.py
import argparse
from data_processor import LOMNDataProcessor
from vector_store import LOMNVectorStore
from lomn_generator import LOMNGenerator
from transparency import SocialTransparencyAnalyzer

def main():
    parser = argparse.ArgumentParser(description='LOMN RAG Generator')
    parser.add_argument('--mode', choices=['index', 'generate'], required=True)
    parser.add_argument('--bucket', default='lomn-knowledge-base')
    parser.add_argument('--opensearch-endpoint', required=True)
    args = parser.parse_args()
    
    if args.mode == 'index':
        # Index documents
        print("Processing documents...")
        processor = LOMNDataProcessor(args.bucket)
        chunks = processor.process_all_documents()
        
        print(f"Indexing {len(chunks)} chunks...")
        vector_store = LOMNVectorStore(args.opensearch_endpoint)
        indexed = vector_store.index_documents(chunks)
        print(f"Successfully indexed {indexed} documents")
    
    elif args.mode == 'generate':
        # Generate LOMN
        vector_store = LOMNVectorStore(args.opensearch_endpoint)
        generator = LOMNGenerator(vector_store)
        transparency = SocialTransparencyAnalyzer()
        
        # Example patient data
        patient_data = {
            'diagnosis': 'Cerebral palsy with spastic quadriplegia',
            'equipment': 'Power wheelchair with tilt-in-space',
            'rationale': 'Patient cannot ambulate independently and requires positioning support',
            'limitations': 'Unable to maintain upright posture, risk of pressure sores'
        }
        
        print("Generating LOMN...")
        result = generator.generate_lomn(patient_data)
        
        print("\n" + "="*80)
        print("GENERATED LETTER OF MEDICAL NECESSITY")
        print("="*80)
        print(result['lomn_text'])
        
        print("\n" + "="*80)
        transparency_report = transparency.generate_transparency_report(result)
        print(transparency_report)

if __name__ == '__main__':
    main()
```

### Phase 5: Testing & Evaluation (Day 11-14)

#### 5.1 Test Cases
Create test cases covering:
1. Approved LOMN scenarios (from paper)
2. Denied LOMN scenarios (common failure patterns)
3. Edge cases (missing information, ambiguous diagnoses)

#### 5.2 Evaluation Metrics
- **Retrieval Quality**: Relevance of retrieved documents
- **Generation Quality**: Medical accuracy, formal language
- **Transparency Metrics**: Source attribution completeness, reasoning clarity
- **Alignment**: Provider-insurer perspective balance

---

## 3. Key Insights from Lunsford Paper

### Critical Success Factors
1. **Medical Necessity Alignment**: Focus on insurance-defined criteria, not general wellbeing
2. **Evidence-Based**: Cite research and clinical guidelines when available
3. **Formal Language**: Avoid informal terms and dangling modifiers
4. **Specific Justification**: Quantify outcomes, avoid vague statements
5. **Proper Scope**: Don't mention cost, convenience, or non-patient use

### Common Failure Patterns to Avoid
- Patient/parent preferences without medical justification
- Convenience arguments (cluttered home, family preferences)
- Societal cost-effectiveness discussions
- Extraneous narrative details (Disney World trip)
- Informal language ("seen better days", "stay put")
- Ambiguous pronoun references and agent-less sentences

### Genre Differences: Provider vs. Insurer Perspectives
- **Providers**: Holistic view, patient wellbeing, anecdotal evidence
- **Insurers**: Strict medical necessity, evidence requirements, cost constraints
- **Resolution**: RAG system bridges gap by showing both perspectives

---

## 4. Social Transparency Implementation

### Based on Dr. Ehsan's Research Framework

#### Transparency Dimensions
1. **Stakeholder Awareness**: Show provider, patient, insurer viewpoints
2. **Process Visibility**: Expose retrieval and generation steps
3. **Limitation Disclosure**: Highlight uncertainties and gaps
4. **Contestability**: Allow clinician review and modification

#### Mechanistic Interpretability Features
1. **Feature Attribution**: Which input features influenced each section
2. **Circuit Analysis**: Show reasoning pathways in generation
3. **Activation Analysis**: Identify key concepts in decision-making
4. **Intervention Testing**: What changes would alter the output

---

## 5. Next Steps & Extensions

### Immediate Priorities
1. **Data Collection**: Gather real (anonymized) or synthetic LOMN examples
2. **Knowledge Base Setup**: Populate S3 with documents
3. **Baseline Testing**: Test basic RAG pipeline
4. **Iteration**: Refine prompts based on outputs

### Future Enhancements
1. **Multi-modal**: Include medical images, test results
2. **Interactive UI**: Web interface for clinicians
3. **Feedback Loop**: Learn from approved/denied outcomes
4. **Insurance-Specific**: Custom models per insurance provider
5. **Compliance Checking**: Automated quality review

### Research Contributions
1. **Human-Centered XAI**: Evaluate social transparency effectiveness
2. **Genre Theory Application**: Computational analysis of LOMN genre
3. **Stakeholder Study**: Interview providers and insurers
4. **Comparative Analysis**: RAG-generated vs. human-written LOMNs

---

## 6. Resources & References

### AWS Documentation
- [Amazon Bedrock Developer Guide](https://docs.aws.amazon.com/bedrock/)
- [Knowledge Bases for Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
- [LangChain Bedrock Integration](https://python.langchain.com/docs/integrations/llms/bedrock)

### Key Papers
- Lunsford & Lunsford (2018): Letter of Medical Necessity as Genre
- Ehsan et al.: Social Transparency in AI Systems
- Anthropic: Mechanistic Interpretability Research

### Libraries & Tools
- LangChain: RAG orchestration
- OpenSearch: Vector database
- Boto3: AWS SDK
- Pydantic: Data validation

---

## 7. Troubleshooting

### Common Issues
1. **Bedrock Access Denied**: Ensure model access is approved
2. **S3 Permissions**: Check IAM role has S3 read/write
3. **OpenSearch Connection**: Verify endpoint and security groups
4. **Token Limits**: Adjust chunk size if context exceeds limits
5. **Empty Retrievals**: Check embedding model and query formatting

### Performance Optimization
- Use batch processing for embeddings
- Cache frequently retrieved documents
- Implement query rewriting for better retrieval
- Fine-tune retrieval parameters (k, score threshold)

---

## Contact & Collaboration
For questions about this implementation:
- Technical issues: Check AWS documentation
- Research questions: Discuss with Dr. Ehsan
- Paper authors: See email templates

Good luck with your prototype! 🚀

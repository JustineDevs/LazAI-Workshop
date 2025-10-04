#!/usr/bin/env python3
"""
LazAI Integration Service
AI inference microservice for DataStreamNFT platform
Integrates with LM Studio, GPT-4o, and other AI models
"""

from flask import Flask, request, jsonify
import requests
import json
import time
import hashlib
from datetime import datetime
import os
from typing import Dict, Any, Optional

app = Flask(__name__)

# Configuration
AI_MODELS = {
    'gemini': {
        'endpoint': os.getenv('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'),
        'api_key': os.getenv('GEMINI_API_KEY', 'mock-key'),
        'model': 'gemini-pro'
    },
    'gpt-4o': {
        'endpoint': os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
        'api_key': os.getenv('OPENAI_API_KEY', 'mock-key'),
        'model': 'gpt-4o'
    },
    'lm-studio': {
        'endpoint': os.getenv('LM_STUDIO_URL', 'http://localhost:1234/v1/chat/completions'),
        'api_key': os.getenv('LM_STUDIO_API_KEY', 'mock-key'),
        'model': 'local-model'
    },
    'claude': {
        'endpoint': os.getenv('CLAUDE_API_URL', 'https://api.anthropic.com/v1/messages'),
        'api_key': os.getenv('CLAUDE_API_KEY', 'mock-key'),
        'model': 'claude-3-sonnet-20240229'
    }
}

# Backend API configuration
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3001')

class AIService:
    def __init__(self):
        self.query_history = []
        self.model_stats = {}
    
    def process_query(self, token_id: str, query: str, model: str, wallet: str) -> Dict[str, Any]:
        """Process AI query with metering and payment"""
        start_time = time.time()
        
        try:
            # Step 1: Validate query and token
            if not self._validate_query(token_id, query, wallet):
                return self._error_response("Invalid query or token")
            
            # Step 2: Trigger payment metering via backend
            payment_result = self._trigger_payment_metering(token_id, query, model, wallet)
            if not payment_result.get('success'):
                return self._error_response("Payment metering failed")
            
            # Step 3: Run AI inference
            ai_result = self._run_ai_inference(query, model)
            
            # Step 4: Calculate processing time and cost
            processing_time = int((time.time() - start_time) * 1000)
            cost = self._calculate_cost(processing_time, model)
            
            # Step 5: Log query for analytics
            self._log_query(token_id, query, model, wallet, processing_time, cost)
            
            return {
                'success': True,
                'data': {
                    'tokenId': token_id,
                    'query': query,
                    'model': model,
                    'result': ai_result['content'],
                    'confidence': ai_result.get('confidence', 0.85),
                    'cost': cost,
                    'processingTime': processing_time,
                    'timestamp': datetime.utcnow().isoformat(),
                    'transactionHash': payment_result.get('transactionHash'),
                    'wallet': wallet
                }
            }
            
        except Exception as e:
            return self._error_response(f"AI processing failed: {str(e)}")
    
    def _validate_query(self, token_id: str, query: str, wallet: str) -> bool:
        """Validate query parameters"""
        return bool(token_id and query and wallet and len(query.strip()) > 0)
    
    def _trigger_payment_metering(self, token_id: str, query: str, model: str, wallet: str) -> Dict[str, Any]:
        """Trigger payment metering via backend API"""
        try:
            response = requests.post(f"{BACKEND_API_URL}/api/v1/query/meter", 
                json={
                    'tokenId': token_id,
                    'queryType': f'ai_{model}',
                    'cost': '0.001',  # Base cost
                    'wallet': wallet
                },
                timeout=10
            )
            return response.json()
        except Exception as e:
            print(f"Payment metering error: {e}")
            return {'success': False, 'error': str(e)}
    
    def _run_ai_inference(self, query: str, model: str) -> Dict[str, Any]:
        """Run AI inference using specified model"""
        model_config = AI_MODELS.get(model, AI_MODELS['gemini'])
        
        if model == 'mock':
            return self._mock_ai_response(query)
        
        try:
            if model == 'gemini':
                return self._call_gemini(query, model_config)
            elif model == 'gpt-4o':
                return self._call_openai(query, model_config)
            elif model == 'lm-studio':
                return self._call_lm_studio(query, model_config)
            elif model == 'claude':
                return self._call_claude(query, model_config)
            else:
                return self._mock_ai_response(query)
        except Exception as e:
            print(f"AI inference error: {e}")
            return self._mock_ai_response(query)
    
    def _call_openai(self, query: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Call OpenAI GPT-4o API"""
        headers = {
            'Authorization': f'Bearer {config["api_key"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': config['model'],
            'messages': [
                {'role': 'system', 'content': 'You are an AI assistant specialized in data analysis and insights.'},
                {'role': 'user', 'content': query}
            ],
            'max_tokens': 1000,
            'temperature': 0.7
        }
        
        response = requests.post(config['endpoint'], headers=headers, json=payload, timeout=30)
        result = response.json()
        
        return {
            'content': result['choices'][0]['message']['content'],
            'confidence': 0.9,
            'model': config['model']
        }
    
    def _call_gemini(self, query: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Call Google Gemini API"""
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            'contents': [{
                'parts': [{
                    'text': f"You are an AI assistant specialized in data analysis and insights. Please analyze the following query: {query}"
                }]
            }],
            'generationConfig': {
                'temperature': 0.7,
                'maxOutputTokens': 1000,
                'topP': 0.8,
                'topK': 10
            }
        }
        
        url = f"{config['endpoint']}?key={config['api_key']}"
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        result = response.json()
        
        return {
            'content': result['candidates'][0]['content']['parts'][0]['text'],
            'confidence': 0.9,
            'model': config['model']
        }
    
    def _call_lm_studio(self, query: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Call LM Studio local API"""
        headers = {
            'Authorization': f'Bearer {config["api_key"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': config['model'],
            'messages': [
                {'role': 'system', 'content': 'You are a local AI model for data analysis.'},
                {'role': 'user', 'content': query}
            ],
            'max_tokens': 1000,
            'temperature': 0.7
        }
        
        response = requests.post(config['endpoint'], headers=headers, json=payload, timeout=30)
        result = response.json()
        
        return {
            'content': result['choices'][0]['message']['content'],
            'confidence': 0.8,
            'model': config['model']
        }
    
    def _call_claude(self, query: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Call Claude API"""
        headers = {
            'x-api-key': config['api_key'],
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        payload = {
            'model': config['model'],
            'max_tokens': 1000,
            'messages': [
                {'role': 'user', 'content': query}
            ]
        }
        
        response = requests.post(config['endpoint'], headers=headers, json=payload, timeout=30)
        result = response.json()
        
        return {
            'content': result['content'][0]['text'],
            'confidence': 0.9,
            'model': config['model']
        }
    
    def _mock_ai_response(self, query: str) -> Dict[str, Any]:
        """Generate mock AI response for development"""
        responses = [
            f"Based on the data analysis, here's what I found regarding '{query}': The dataset shows significant patterns that suggest...",
            f"Analysis of '{query}' reveals several key insights: 1) Data trends indicate... 2) Statistical analysis shows... 3) Predictive modeling suggests...",
            f"Comprehensive analysis of '{query}' yields the following findings: The data exhibits strong correlation patterns with confidence intervals...",
            f"Deep analysis of '{query}' uncovers: Market trends show... Risk factors include... Opportunities present...",
            f"Data-driven insights for '{query}': Performance metrics indicate... Comparative analysis reveals... Future projections suggest..."
        ]
        
        import random
        content = random.choice(responses)
        
        return {
            'content': content,
            'confidence': 0.75 + random.random() * 0.2,
            'model': 'mock-ai'
        }
    
    def _calculate_cost(self, processing_time: int, model: str) -> str:
        """Calculate cost based on processing time and model"""
        base_costs = {
            'gemini': 0.0001,  # Very low cost for free tier
            'gpt-4o': 0.002,
            'lm-studio': 0.0005,
            'claude': 0.0015,
            'mock': 0.001
        }
        
        base_cost = base_costs.get(model, 0.001)
        time_multiplier = 1 + (processing_time / 10000)  # Slight increase for longer processing
        
        return f"{base_cost * time_multiplier:.6f}"
    
    def _log_query(self, token_id: str, query: str, model: str, wallet: str, processing_time: int, cost: str):
        """Log query for analytics and monitoring"""
        query_log = {
            'tokenId': token_id,
            'query': query[:100] + '...' if len(query) > 100 else query,
            'model': model,
            'wallet': wallet,
            'processingTime': processing_time,
            'cost': cost,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.query_history.append(query_log)
        
        # Update model statistics
        if model not in self.model_stats:
            self.model_stats[model] = {'queries': 0, 'totalTime': 0, 'totalCost': 0}
        
        self.model_stats[model]['queries'] += 1
        self.model_stats[model]['totalTime'] += processing_time
        self.model_stats[model]['totalCost'] += float(cost)
    
    def _error_response(self, message: str) -> Dict[str, Any]:
        """Generate error response"""
        return {
            'success': False,
            'error': message,
            'timestamp': datetime.utcnow().isoformat()
        }

# Initialize AI service
ai_service = AIService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'models_available': list(AI_MODELS.keys()),
        'total_queries': len(ai_service.query_history)
    })

@app.route('/infer', methods=['POST'])
def run_inference():
    """Main AI inference endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        required_fields = ['tokenId', 'query', 'wallet']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        token_id = data['tokenId']
        query = data['query']
        model = data.get('model', 'gpt-4o')
        wallet = data['wallet']
        
        result = ai_service.process_query(token_id, query, model, wallet)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/models', methods=['GET'])
def get_available_models():
    """Get available AI models"""
    return jsonify({
        'success': True,
        'data': {
            'models': list(AI_MODELS.keys()),
            'default': 'gemini',
            'recommended': ['gemini', 'gpt-4o', 'lm-studio']
        }
    })

@app.route('/stats', methods=['GET'])
def get_service_stats():
    """Get service statistics"""
    return jsonify({
        'success': True,
        'data': {
            'totalQueries': len(ai_service.query_history),
            'modelStats': ai_service.model_stats,
            'uptime': time.time(),
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/query-history', methods=['GET'])
def get_query_history():
    """Get recent query history"""
    limit = request.args.get('limit', 50, type=int)
    recent_queries = ai_service.query_history[-limit:]
    
    return jsonify({
        'success': True,
        'data': {
            'queries': recent_queries,
            'total': len(ai_service.query_history),
            'limit': limit
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 5000))
    debug = os.getenv('AI_SERVICE_DEBUG', 'false').lower() == 'true'
    
    print(f"🤖 Starting LazAI Integration Service on port {port}")
    print(f"📊 Available models: {', '.join(AI_MODELS.keys())}")
    print(f"🔗 Backend API: {BACKEND_API_URL}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

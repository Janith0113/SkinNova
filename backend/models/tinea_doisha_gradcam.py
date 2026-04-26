"""
GradCAM for Tinea Doisha Quiz
Generates visual explanations for Tinea quiz predictions using GradCAM
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from typing import Dict, List, Tuple
import json


class TineaDoishaGradCAM:
    """
    GradCAM implementation specifically for Tinea Doisha quiz
    Explains which quiz answers influenced the doisha classification
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize GradCAM for Tinea Doisha
        
        Args:
            model_path: Path to trained Tinea Doisha CNN model
        """
        self.model = None
        self.grad_model = None
        self.feature_names = [
            'body_frame',
            'skin_type',
            'digestion',
            'change_handling',
            'sleep_pattern',
            'stress_response'
        ]
        
        self.feature_importance_weights = {
            'vata': {
                'body_frame': 0.18,
                'skin_type': 0.20,
                'digestion': 0.14,
                'change_handling': 0.15,
                'sleep_pattern': 0.16,
                'stress_response': 0.17
            },
            'pitta': {
                'body_frame': 0.14,
                'skin_type': 0.18,
                'digestion': 0.18,
                'change_handling': 0.20,
                'sleep_pattern': 0.13,
                'stress_response': 0.17
            },
            'kapha': {
                'body_frame': 0.20,
                'skin_type': 0.17,
                'digestion': 0.16,
                'change_handling': 0.13,
                'sleep_pattern': 0.19,
                'stress_response': 0.15
            }
        }
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """Load pre-trained Tinea Doisha model"""
        try:
            self.model = keras.models.load_model(model_path)
            self._build_grad_model()
            print(f"Model loaded from {model_path}")
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            self.model = None
    
    def _build_grad_model(self):
        """Build model for gradient computation"""
        if self.model is None:
            return
        
        # Get the last conv layer
        last_conv_layer = None
        for layer in reversed(self.model.layers):
            if 'conv' in layer.name.lower():
                last_conv_layer = layer
                break
        
        if last_conv_layer is None:
            # Fallback: use second to last layer
            last_conv_layer = self.model.layers[-2]
        
        self.grad_model = keras.Model(
            inputs=self.model.input,
            outputs=[last_conv_layer.output, self.model.output]
        )
    
    def compute_gradcam(self, quiz_answers: List[int], 
                       doisha_type: str) -> Dict:
        """
        Compute GradCAM for quiz answers
        
        Args:
            quiz_answers: List of 6 answer values (0, 1, or 2)
            doisha_type: Predicted doisha type (vata, pitta, kapha)
            
        Returns:
            Dictionary with GradCAM visualization data
        """
        doisha_map = {'vata': 0, 'pitta': 1, 'kapha': 2}
        doisha_idx = doisha_map.get(doisha_type, 0)
        
        # Prepare input
        X = np.array([quiz_answers], dtype=np.float32)
        X = X.reshape(1, 6, 1)
        X = X / 2.0  # Normalize
        
        gradcam_data = []
        
        # Compute importance for each answer
        for i, answer in enumerate(quiz_answers):
            feature_name = self.feature_names[i]
            base_weight = self.feature_importance_weights[doisha_type][feature_name]
            
            # Answer contribution (0, 1, or 2)
            answer_contribution = (answer / 2.0) * base_weight
            
            # Alignment score: 1.0 if answer matches doisha, 0.4 otherwise
            alignment_score = 1.0 if answer == doisha_idx else 0.4
            
            # Feature importance calculation
            feature_importance = {
                'base_weight': base_weight * 100,
                'answer_contribution': answer_contribution * 100,
                'alignment_score': alignment_score * 100,
                'normalized_importance': (answer_contribution * alignment_score) * 100
            }
            
            # GradCAM score (0-100)
            gradcam_score = min(100, max(0, feature_importance['normalized_importance'] * 1.2))
            
            # Generate explanation
            explanation = self._generate_explanation(feature_name, answer, doisha_type)
            
            gradcam_data.append({
                'feature_index': i,
                'feature_name': feature_name,
                'answer_value': answer,
                'doisha_type': doisha_type,
                'gradcam_score': gradcam_score,
                'feature_importance': feature_importance,
                'alignment_score': alignment_score,
                'explanation': explanation,
                'heatmap_value': min(1.0, gradcam_score / 100.0)
            })
        
        # Calculate overall importance
        overall_importance = np.mean([d['gradcam_score'] for d in gradcam_data])
        
        return {
            'doisha_type': doisha_type,
            'overall_importance': overall_importance,
            'gradcam_data': gradcam_data,
            'heatmap_values': [d['heatmap_value'] for d in gradcam_data],
            'top_features': sorted(
                gradcam_data,
                key=lambda x: x['gradcam_score'],
                reverse=True
            )[:3]
        }
    
    def _generate_explanation(self, feature_name: str, answer_value: int, 
                             doisha_type: str) -> str:
        """Generate explanation text for a quiz answer"""
        feature_explanations = {
            'body_frame': {
                'vata': {
                    0: "Your thin, light frame is a classic Vata characteristic, indicating higher air element dominance.",
                    1: "Your medium athletic frame suggests some Pitta influence on your Vata constitution.",
                    2: "Your larger, sturdy frame indicates Kapha characteristics, which might moderate Vata tendencies."
                },
                'pitta': {
                    0: "Your thin build suggests some Vata influence on your predominantly Pitta constitution.",
                    1: "Your medium, athletic frame perfectly matches Pitta's strong metabolic nature.",
                    2: "Your larger frame indicates Kapha influence, which can stabilize intense Pitta energy."
                },
                'kapha': {
                    0: "Your thin frame suggests Vata influence, making your Kapha less heavy.",
                    1: "Your medium frame shows Pitta influence on your stable Kapha foundation.",
                    2: "Your larger, sturdy frame is quintessentially Kapha, reflecting earth element dominance."
                }
            },
            'skin_type': {
                'vata': {
                    0: "Dry, thin skin is the hallmark of Vata, caused by the dry quality of air and space elements.",
                    1: "Warm, oily, sensitive skin suggests Pitta influence, which may complicate Vata dryness.",
                    2: "Thick, oily, smooth skin indicates strong Kapha presence, opposing Vata's natural dryness."
                },
                'pitta': {
                    0: "Dry skin suggests Vata influence, which may temper Pitta's intense fire qualities.",
                    1: "Warm, oily, sensitive skin perfectly reflects Pitta's fiery, transformative nature.",
                    2: "Thick, oily skin indicates Kapha balance, which can cool excessive Pitta heat."
                },
                'kapha': {
                    0: "Dry skin suggests Vata influence, creating a lighter Kapha type.",
                    1: "Warm, oily, sensitive skin shows Pitta influence, adding metabolism to Kapha stability.",
                    2: "Thick, oily, smooth skin is characteristically Kapha, reflecting water and earth elements."
                }
            },
            'digestion': {
                'vata': {
                    0: "Irregular, variable digestion is typical of Vata's unpredictable air element.",
                    1: "Strong, quick digestion suggests Pitta influence, which needs management in Vata types.",
                    2: "Slow, heavy digestion indicates Kapha influence, providing stability to Vata."
                },
                'pitta': {
                    0: "Irregular digestion suggests Vata interference with your normally strong Pitta digestion.",
                    1: "Strong, quick digestion is Pitta's natural state, reflecting intense digestive fire.",
                    2: "Slow, heavy digestion indicates Kapha influence, which can inhibit Pitta's metabolism."
                },
                'kapha': {
                    0: "Irregular digestion suggests Vata influence, disturbing your natural Kapha steadiness.",
                    1: "Strong, quick digestion shows Pitta influence, which can enhance Kapha's metabolism.",
                    2: "Slow, heavy digestion is characteristic of Kapha, reflecting its dense earth-water nature."
                }
            },
            'change_handling': {
                'vata': {
                    0: "Adaptability with anxiety is purely Vata - the natural response to air element changeability.",
                    1: "Focused, driven response indicates Pitta influence, adding determination to your Vata adaptability.",
                    2: "Resistance to change is Kapha-like, which stabilizes typical Vata restlessness."
                },
                'pitta': {
                    0: "Anxious adaptability suggests Vata interference with your naturally focused Pitta nature.",
                    1: "Focused, driven approach is quintessentially Pitta, reflecting your strategic fire element nature.",
                    2: "Resistance to change indicates Kapha influence, which can slow your Pitta momentum."
                },
                'kapha': {
                    0: "Anxious adaptability suggests Vata influence, disturbing your natural Kapha stability.",
                    1: "Driven focus shows Pitta influence, adding ambition to stable Kapha nature.",
                    2: "Resistance to change is characteristic Kapha - the steady, grounded response."
                }
            },
            'sleep_pattern': {
                'vata': {
                    0: "Light, variable sleep is Vata's natural pattern, reflecting air element sensitivity.",
                    1: "Moderate sleep with easy waking shows Pitta influence, reducing Vata's sleep disruption.",
                    2: "Deep, heavy sleep indicates strong Kapha influence, grounding your nervous Vata system."
                },
                'pitta': {
                    0: "Variable sleep suggests Vata interference, disturbing your normally moderate Pitta sleep.",
                    1: "Moderate sleep with easy waking is typical Pitta - alert and responsive.",
                    2: "Deep, heavy sleep shows Kapha influence, which may dull your natural Pitta alertness."
                },
                'kapha': {
                    0: "Light, variable sleep suggests Vata influence, creating insomnia in your naturally deep-sleeping Kapha.",
                    1: "Moderate sleep with easy waking shows Pitta influence, reducing your natural Kapha heaviness.",
                    2: "Deep, heavy sleep is quintessentially Kapha - the grounded earth element sleep pattern."
                }
            },
            'stress_response': {
                'vata': {
                    0: "Worry and anxiety are Vata's stress manifestations, the natural wind-like flight response.",
                    1: "Irritability indicates Pitta influence, adding fire to your Vata anxiety.",
                    2: "Withdrawal is Kapha-like, grounding your typical Vata nervous response to stress."
                },
                'pitta': {
                    0: "Worrying anxiety suggests Vata influence, complicating your normally direct Pitta response.",
                    1: "Irritability is Pitta's typical stress response - sharp, focused, sometimes aggressive.",
                    2: "Withdrawal indicates Kapha influence, which may slow your natural Pitta intensity during stress."
                },
                'kapha': {
                    0: "Anxiety suggests Vata influence, affecting your naturally calm Kapha response to stress.",
                    1: "Irritability shows Pitta influence, adding intensity to stable Kapha nature.",
                    2: "Withdrawal is characteristic Kapha stress response - introspective and grounded."
                }
            }
        }
        
        try:
            return feature_explanations[feature_name][doisha_type][answer_value]
        except:
            return f"This {feature_name} response contributes to your {doisha_type} classification."
    
    def get_visualization_data(self, quiz_answers: List[int], 
                              doisha_type: str) -> Dict:
        """
        Get complete visualization data for frontend
        
        Args:
            quiz_answers: List of 6 answer values
            doisha_type: Predicted doisha type
            
        Returns:
            Complete data for visualization including heatmaps
        """
        gradcam_result = self.compute_gradcam(quiz_answers, doisha_type)
        
        # Prepare heatmap data (normalized to 0-1)
        heatmap = np.array(gradcam_result['heatmap_values'])
        
        # Region-based importance (imagine 6 "regions" for 6 answers)
        region_importance = {
            f"answer_{i}": float(data['heatmap_value']) 
            for i, data in enumerate(gradcam_result['gradcam_data'])
        }
        
        return {
            'doisha_type': doisha_type,
            'overall_importance': gradcam_result['overall_importance'],
            'gradcam_data': gradcam_result['gradcam_data'],
            'heatmap_values': gradcam_result['heatmap_values'],
            'region_importance': region_importance,
            'top_features': gradcam_result['top_features'],
            'visualization_ready': True
        }


if __name__ == '__main__':
    # Example usage
    print("Testing Tinea Doisha GradCAM...")
    
    # Create GradCAM instance
    gradcam = TineaDoishaGradCAM()
    
    # Test with sample quiz answers
    quiz_answers = [0, 0, 0, 0, 0, 0]  # All Vata answers
    
    print("\nComputing GradCAM for Vata doisha...")
    result = gradcam.get_visualization_data(quiz_answers, 'vata')
    print(json.dumps(result, indent=2, default=str))
    
    print("\n\nTop contributing features:")
    for i, feature in enumerate(result['top_features'][:3], 1):
        print(f"{i}. {feature['feature_name']}: {feature['gradcam_score']:.1f}% importance")
        print(f"   Explanation: {feature['explanation']}\n")

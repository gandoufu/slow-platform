from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

def check_assertions(response_data: Dict[str, Any], assertions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluate assertions against response data.
    response_data: { "status_code": 200, "headers": {}, "body": {}, "duration": 0.1 }
    assertions: [{"source": "status_code", "operator": "eq", "value": 200}, ...]
    
    Returns: List of assertions with 'result': True/False
    """
    results = []
    if not assertions:
        return results

    for assertion in assertions:
        source = assertion.get("source")
        expression = assertion.get("expression")
        operator = assertion.get("operator")
        expected_value = assertion.get("value")
        
        actual_value = None
        error_msg = None
        
        try:
            # Extract value
            if source == "status_code":
                actual_value = response_data.get("status_code")
            elif source == "response_time":
                actual_value = response_data.get("duration")
            elif source == "header":
                headers = response_data.get("headers", {})
                # Headers are usually case-insensitive, but here we assume dictionary access
                # Convert headers to lower case keys for robust check
                lower_headers = {k.lower(): v for k, v in headers.items()}
                actual_value = lower_headers.get(expression.lower())
            elif source == "body":
                body = response_data.get("body")
                if expression and expression.startswith("$"):
                    # Use JSONPath
                    try:
                        from jsonpath_ng import parse
                        jsonpath_expr = parse(expression)
                        matches = [match.value for match in jsonpath_expr.find(body)]
                        if matches:
                            actual_value = matches[0] # Take first match
                        else:
                            actual_value = None
                    except ImportError:
                        error_msg = "JSONPath library not installed"
                        logger.error(error_msg)
                    except Exception as e:
                        error_msg = str(e)
                        logger.error(f"JSONPath error: {e}")
                else:
                    actual_value = None # Invalid expression
            
            # Compare
            passed = False
            if error_msg:
                passed = False
            else:
                if operator == "eq":
                    # Handle type conversion for comparison
                    if isinstance(expected_value, int) and isinstance(actual_value, str) and actual_value.isdigit():
                        actual_value = int(actual_value)
                    passed = str(actual_value) == str(expected_value)
                elif operator == "gt":
                    passed = float(actual_value) > float(expected_value)
                elif operator == "lt":
                    passed = float(actual_value) < float(expected_value)
                elif operator == "contains":
                    passed = str(expected_value) in str(actual_value)
                else:
                    error_msg = f"Unknown operator: {operator}"

        except Exception as e:
            passed = False
            error_msg = str(e)

        results.append({
            **assertion,
            "actual_value": actual_value,
            "passed": passed,
            "error": error_msg
        })
        
    return results

import os
import importlib.util
import logging

# Configure logging to provide informative messages, including timestamps and log level
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_module_from_path(module_name, file_path):
    # Check if the specified file exists
    if not os.path.exists(file_path):
        logging.error(f"File {file_path} does not exist.")
        return None
    
    # Create a module specification from the file path
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    # If the specification or loader cannot be created, log an error
    if spec is None or spec.loader is None:
        logging.error(f"Could not create a spec for the module {module_name}.")
        return None
    
    # Create a module object from the specification
    module = importlib.util.module_from_spec(spec)
    try:
        # Attempt to execute the module to load its contents
        spec.loader.exec_module(module)
        logging.info(f"Successfully loaded module {module_name} from {file_path}.")
    except Exception as e:
        # Log any errors that occur during module loading
        logging.error(f"Error loading module {module_name}: {e}")
        return None
    
    # Return the loaded module
    return module

# Define a dictionary of default questions in case of errors or technical difficulties
default_questions = {
    1: "What is your name?",
    2: "How are you feeling today?",
    3: "What is your favorite hobby?",
    4: "What is the capital of France?",
    5: "Can you describe your ideal vacation?",
    6: "What motivates you to work hard?",
    7: "Who is your role model, and why?",
    8: "What is your favorite book, and why?",
    9: "How do you handle stress?",
    10: "What is one skill you would like to learn, and why?"
}

# Define the path to the Randomized_Selection script
module_path = "/mnt/data/Randomized_Selection.py"
# Attempt to load the Randomized_Selection module using the provided path
Randomized_Selection = load_module_from_path("Randomized_Selection", module_path)

# If the module was successfully loaded, try to get the next assessment question
if Randomized_Selection:
    try:
        # Call the function to get the next question
        next_question = Randomized_Selection.next_assessment_question()
        logging.info(f"Next assessment question: {next_question}")
    except AttributeError:
        # Handle the case where the expected function is not present in the module
        logging.error("The function 'next_assessment_question' does not exist in the provided file.")
        # Fall back to a default question
        next_question = default_questions.get(1, "No default question available.")
    except Exception as e:
        # Handle any other exceptions that might occur
        logging.error(f"An error occurred while fetching the next question: {e}")
        # Fall back to a default question
        next_question = default_questions.get(2, "No default question available.")
else:
    # Handle the case where the module could not be loaded
    next_question = default_questions.get(3, "No default question available.")

# Output the result of the next question
print(next_question)

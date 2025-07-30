import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "https://*.netlify.app", "https://*.vercel.app", "https://*.up.railway.app", "https://lambent-froyo-eb2f40.netlify.app"]}}, supports_credentials=False)

# Set your Gemini API key (use an environment variable for security)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or "AIzaSyBqR5BV68Jq4Rwi1ZGu9B0u3H7S4y-PB84"
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/', methods=['GET'])
def health_check():
    try:
        logger.info("Health check endpoint called")
        return jsonify({
            "status": "healthy", 
            "message": "AI Server is running",
            "timestamp": str(datetime.now()),
            "port": os.environ.get("PORT", "unknown"),
            "environment": os.environ.get("RAILWAY_ENVIRONMENT", "unknown")
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    try:
        logger.info("Test endpoint called")
        return jsonify({"message": "Test endpoint working"})
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user-story', methods=['POST'])
def user_story():
    try:
        logger.info("User story endpoint called")
        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400
            
        feature = data.get('feature', '')
        if not feature:
            logger.error("No feature provided in request")
            return jsonify({'error': 'No feature provided'}), 400
            
        logger.info(f"Received user story request for feature: {feature}")
        
        prompt = f"""
---

### Prompt for Writing User Stories in Markdown Format

---

### Role Definition
You are a **Product Owner and Agile Business Analyst** with a strong understanding of software delivery and stakeholder collaboration. Your role is to write clear, actionable user stories based on input ideas or messages, following Agile best practices. Your output must help the whole team (tech + non-tech) understand what to build and why.

---

### Workflow Steps

#### Step 1: Analyze the Input Message
- Understand the core intent behind the feature or idea in `{feature}`
- Identify who the primary user is (e.g., merchant, customer, admin, editor)
- Determine the main value this feature brings to that user

#### Step 2: Define Edge Cases
- List all possible edge cases related to the flow
- Group them into success, failure, and conditional scenarios
- Create Acceptance Criteria per edge case (not just per story)

#### Step 3: Generate Output
- Create 1 or more **Epics** based on function names (e.g. Login, Sign Up, Forgot Password)
- Write **User Stories** using the format:

  > As a [role], I want to [action], so that [benefit]

- For each Epic:
  - Print a maximum 2 user stories for Epic 1
  - For each story, write 2–4 **Acceptance Criteria** using `Given / When / Then` format as full sentences
  - Use this heading format: `## Epic 1: [Function Name]`
  - Summarize the rest in this format: _"There are [x] more Epics and about [y] additional user stories."_
  - If no more epics or stories, omit the summary line

#### Step 4: Write in Simple Business Language
- Avoid technical jargon unless universally understood
- Make it understandable for both technical and non-technical roles

---

### Output Format (in Markdown)

This result is generated with AI based on system thinking and user story training by Hoà Trương.

#### Epic Format
```markdown
## Epic 1: [Function Name]
```

#### User Story Format
```markdown
**User Story 1:** As a [role], I want to [do something], so that [desired benefit]
```

#### Acceptance Criteria Format
```markdown
### Acceptance Criteria:
**A/C 1:** Given [context], when [event occurs], then [expected outcome].
**A/C 2:** Given [another context], when [event occurs], then [expected outcome].
**A/C 3:** Given [edge case context], when [event occurs], then [expected outcome].
**A/C 4:** Given [optional scenario], when [event occurs], then [expected outcome].
```

There are remaining **[number] Epics (e.g., Forgot Password, Account Lockout)** and about **[number] User Stories**. But in the scope of the demo, I would like to make it simple.

---

### Notes
- Use **bold markdown** for A/C numbering and inline `Given / When / Then` structure
- Replace `[role]` with real-world user types (e.g. merchant, buyer, admin)
- All Acceptance Criteria should be **testable** and cover **edge cases**
- It's normal to generate multiple **epics** and **user stories** if needed.
- For the final summary of epics and user stories. If AI generates all epics and stories within the limit, **do not print** summary line like _"There are 0 more Epics and about 0 additional user stories." Print the ended message instead (e.g, there are all the user stories I have gen for you).
- **CRITICAL**: For the final summary, ALWAYS show this exact format: _"There are remaining **[number] Epics (e.g., Forgot Password, Account Lockout)** and about **[number] User Stories**. But in the scope of the demo, I would like to make it simple."_
- **CRITICAL**: Include specific examples in parentheses like "(e.g., Forgot Password, Account Lockout)" to make it more informative and beautiful

---

---
"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = {
            "temperature": 1.0,
            "top_p": 0.95,
        }
        response = model.generate_content(prompt, generation_config=generation_config)
        result = response.text
        logger.info(f"Successfully generated user story for feature: {feature}")
        return jsonify({'userStory': result})
    except Exception as e:
        logger.error(f"Error in user story endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 3001))
        logger.info(f"Starting Flask app on port {port}")
        logger.info(f"Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'local')}")
        logger.info(f"GEMINI_API_KEY set: {'Yes' if os.environ.get('GEMINI_API_KEY') else 'No'}")
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        logger.error(f"Failed to start Flask app: {e}")
        raise e 
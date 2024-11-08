# Testing Instructions

## Backend

You will write tests for the backend using pytest. The main application is in `backend/app.py`. 
The models are in the same file as you can see. 

What we want is to test the endpoints of the API, models, and the database. Primary focus is to have unit tests for the endpoints. 
Also, it will be good to see the coverage of the tests. 

You will need to direct us on how to install `pytest`, and any necessary dependencies. 
Also, instead of relying on requirements.txt, it is better to separate the dependencies for the tests. 

The location to write the tests is in the `backend/tests` folder. 

First propose a plan for the tests, and we will review it with you. 


### 1. Test Structure

The tests are in the `backend/tests` folder.

### 2. Test Dependencies

See `backend/requirements-test.txt`.

### 3. Test Categories

#### A. Unit Tests (test_endpoints.py)

- Test each API endpoint individually
- Test successful operations
- Test error cases
- Verify response status codes
- Validate response payloads
- Test input validation

#### B. Model Tests (test_models.py)

- Test model creation
- Test model validation
- Test model relationships
- Test model methods
- Test edge cases

#### C. Integration Tests (test_integration.py)

- Test endpoint-to-database flows
- Test complete user journeys
- Test authentication flows (if applicable)

### 4. Testing Setup

- Create test database configuration
- Set up test fixtures in conftest.py
- Implement database cleanup between tests
- Configure test environment variables

### 5. Coverage Goals

- Aim for minimum 80% code coverage
- Focus on critical path coverage
- Document any intentionally uncovered code

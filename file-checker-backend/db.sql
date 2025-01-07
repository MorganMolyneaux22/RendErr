CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) UNIQUE,
  task_type VARCHAR(255),
  work_package VARCHAR(255),
  completed_date TIMESTAMP,
  total_length INTEGER,
  qa_approved BOOLEAN
);
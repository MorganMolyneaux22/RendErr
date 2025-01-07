CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL,
    task_type VARCHAR(255) NOT NULL,
    work_package VARCHAR(255) NOT NULL,
    completed_date DATE NOT NULL,
    total_length FLOAT NOT NULL,
    qa_approved BOOLEAN NOT NULL,
    UNIQUE (task_id)
);
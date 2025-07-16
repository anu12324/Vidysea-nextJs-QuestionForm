-- CREATE QUERY FOR SECTIONS
CREATE TABLE sections(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
); 

-- FETCH QUERY FRO SECTIONS
SELECT * FROM sections

CREATE TABLE subsections (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

-- FETCH QUERY FOR SUBSECTIONS
SELECT * FROM SUBSECTION

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id),
  subsection_id INTEGER REFERENCES subsections(id),
  question_text TEXT NOT NULL,
  option_type VARCHAR(50) CHECK (option_type IN ('SINGLE', 'MULTI'))
);


CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  marks INTEGER,
  image_path TEXT
);

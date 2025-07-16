-- ENTRYIES FOR SECTIONS 
INSERT INTO sections (id, name) 
VALUES (1, 'Math'), (2, 'Science');

-- ENTRIES FOR SUBSECTIONS
INSERT INTO subsections (id, section_id, name) VALUES (1, 1, 'Algebra'), (2, 1, 'Trigonometry'), 
(3, 1, 'Linear Equations'), (4, 2, 'Gravitation'), 
(5,2,'Motion and Force'), (6, 2, 'Life Processes');
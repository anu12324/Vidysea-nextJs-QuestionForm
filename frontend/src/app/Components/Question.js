'use client';

import { Button, Table, Row, Col, Form, Container } from "react-bootstrap";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function CreateQuestion() {
    const [formDetails, setFormDetails] = useState([]);
    const [sections, setSections] = useState([]);
    const [subSections, setSubSections] = useState([]);
    const [formData, setFormData] = useState({
        section_id: '',
        subsection_id: '',
        question_text: '',
        type: 'SINGLE',
        options: [{ text: '', marks: 0, image: null }]
    });
    const [showAddNewForm, setShowAddNewForm] = useState(false);
    const [isView, setIsView] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/section`).then(res => setSections(res.data));
        getDetails();
    }, []);

    useEffect(() => {
        if (formData.section_id) {

            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subsection?section_id=${formData.section_id}`)
                .then(res => setSubSections(res.data));
        }
    }, [formData.section_id]);

    const getDetails = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/getdetails`)
            .then((res) => {
                setFormDetails(res.data);
            })
            .catch(err => {
                console.error("Error fetching details:", err);
            });
    }

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleFileChange = (index, file) => {
        const newOptions = [...formData.options];
        newOptions[index].image = file;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { text: '', marks: 0, image: null }]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('section_id', formData.section_id);
        formDataToSend.append('subsection_id', formData.subsection_id);
        formDataToSend.append('question_text', formData.question_text);
        formDataToSend.append('type', formData.type);

        formData.options.forEach((opt, i) => {
            formDataToSend.append(`options[${i}][text]`, opt.text);
            formDataToSend.append(`options[${i}][marks]`, opt.marks);
            if (opt.image) {
                formDataToSend.append(`options[${i}][image]`, opt.image);
            }
        });

        for (var pair of formDataToSend.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/question`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Question And Answer Saved Successfully!');
            setFormData({
                section_id: '',
                subsection_id: '',
                question_text: '',
                type: 'SINGLE',
                options: [{ text: '', marks: 0, image: null }]
            });
            setShowAddNewForm(false);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error saving question');
        }
    };

    const handleBack = () => {
        setShowAddNewForm(false);
    }

    const handleView = (res) => {
        setIsView(true);
    }

    return (
        <>
            <Container>
                {
                    !showAddNewForm ?
                        <>
                            <Row className="text-center bg-info mt-5">
                                <h3>Question form Details</h3>
                            </Row>
                            <Row>&nbsp;</Row>
                            <Row>
                                <Col>
                                    <Button variant="outline-primary" size="sm" onClick={() => setShowAddNewForm(true)}>Add New</Button>
                                </Col>
                            </Row>
                            <Row>&nbsp;</Row>
                            <Row>
                                <Table bordered striped>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Srno</th>
                                            <th>Section Name</th>
                                            <th>Sub-Section Name</th>
                                            <th>Questions</th>
                                            <th>Option Type</th>
                                            {/* <th>Option Text</th>
                                            <th>Option Marks</th>
                                            <th>Option Image</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            formDetails.map((res, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <span style={{ cursor: 'pointer' }} onClick={() => handleView(res)}>
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </span>
                                                    </td>
                                                    <td>{res.id}</td>
                                                    <td>{res.section_name}</td>
                                                    <td>{res.subsection_name}</td>
                                                    <td>{res.question_text}</td>
                                                    <td>{res.option_type}</td>
                                                    {/* <td>{res.option_text}</td>
                                                    <td>{res.option_marks}</td>
                                                    <td>{res.option_path}</td> */}
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </Row>
                        </> :
                        <>
                            <Form onSubmit={handleSubmit} className="container mt-4 p-4 bg-light border rounded">
                                <h3 className="text-center bg-info">Create Questions</h3>
                                <hr />
                                <Row>
                                    <Col className="col-md-5">
                                        <label className="form-label">Select Section</label>
                                        <select className="form-select" onChange={e => setFormData({ ...formData, section_id: e.target.value })}>
                                            <option value="">Select</option>
                                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                                        </select>
                                    </Col>
                                    <Col className="col-md-5">
                                        <label className="form-label">Select Sub Section</label>
                                        <select className="form-select" onChange={e => setFormData({ ...formData, subsection_id: e.target.value })}>
                                            <option value="">Select</option>
                                            {subSections.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                        </select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="col-md-5">
                                        <label className="form-label">Type Question</label>
                                        <input type="text" className="form-control" onChange={e => setFormData({ ...formData, question_text: e.target.value })} />
                                    </Col>
                                    <Col className="col-md-5">
                                        <label className="form-label">Single / Multi Option</label>
                                        <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="SINGLE">Single</option>
                                            <option value="MULTI">Multi</option>
                                        </select>
                                    </Col>
                                </Row>
                                <Row>
                                    <label className="form-label">Options:</label>
                                    {formData.options.map((opt, index) => (
                                        <div key={index} className="row g-2 mb-2">
                                            <div className="col-md-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Option text"
                                                    value={opt.text}
                                                    onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Marks"
                                                    value={opt.marks}
                                                    onChange={e => handleOptionChange(index, 'marks', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={e => handleFileChange(index, e.target.files[0])}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </Row>
                                <Row className="text-center">
                                    <Col>
                                        {formData.type === 'MULTI' && (
                                            <Button type="button" variant="outline-primary" size="sm" onClick={addOption}>Add More Options</Button>
                                        )}
                                        &nbsp;
                                        <Button type="submit" variant="outline-success" size="sm">Save</Button>
                                        &nbsp;
                                        <Button variant="outline-danger" size="sm" onClick={handleBack}>Back</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </>
                }
            </Container>
        </>
    );
}

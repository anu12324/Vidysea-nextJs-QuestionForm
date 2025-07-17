'use client';

import { Button } from "react-bootstrap";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreateQuestion() {
    const [sections, setSections] = useState([]);
    const [subSections, setSubSections] = useState([]);
    const [formData, setFormData] = useState({
        section_id: '',
        subsection_id: '',
        question_text: '',
        type: 'SINGLE',
        options: [{ text: '', marks: 0, image: null }]
    });

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/section`).then(res => setSections(res.data));
    }, []);

    useEffect(() => {
        if (formData.section_id) {

            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subsection?section_id=${formData.section_id}`)
                .then(res => setSubSections(res.data));
        }
    }, [formData.section_id]);

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
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error saving question');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="container mt-4 p-4 bg-light border rounded">
            <h3 className="text-center">Create Questions</h3>
            <hr />
            <div className="mb-3">
                <label className="form-label">Select Section</label>
                <select className="form-select" onChange={e => setFormData({ ...formData, section_id: e.target.value })}>
                    <option value="">Select</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Select Sub Section</label>
                <select className="form-select" onChange={e => setFormData({ ...formData, subsection_id: e.target.value })}>
                    <option value="">Select</option>
                    {subSections.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Type Question</label>
                <input type="text" className="form-control" onChange={e => setFormData({ ...formData, question_text: e.target.value })} />
            </div>

            <div className="mb-3">
                <label className="form-label">Single / Multi Option</label>
                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="SINGLE">Single</option>
                    <option value="MULTI">Multi</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Options:</label>
                {formData.options.map((opt, index) => (
                    <div key={index} className="row g-2 mb-2">
                        <div className="col-md-4">
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
                        <div className="col-md-5">
                            <input
                                type="file"
                                className="form-control"
                                onChange={e => handleFileChange(index, e.target.files[0])}
                            />
                        </div>
                    </div>
                ))}
                {formData.type === 'MULTI' && (
                    <Button type="button" variant="outline-primary" onClick={addOption}>Add More Option</Button>
                )}
            </div>
            <div className="text-center">
                <Button type="submit" variant="outline-success">Save</Button>
            </div>
        </form>
    );
}

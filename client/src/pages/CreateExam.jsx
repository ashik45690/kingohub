import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, Card, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import examService from '../services/examService';

const { RangePicker } = DatePicker;

const CreateExam = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const data = {
                ...values,
                startDate: values.dateRange[0].toDate(),
                endDate: values.dateRange[1].toDate(),
                authorizedEmails: values.authorizedEmails ? values.authorizedEmails.split(',').map(e => e.trim()) : [],
            };
            const res = await examService.createExam(data);
            notification.success({ message: 'Exam created successfully!' });
            navigate(`/exam-details/${res._id}`);
        } catch (err) {
            console.error('Error creating exam:', err);
            const message = err.response?.data?.message || err.message || 'Failed to create exam';
            notification.error({
                message: 'Error Creating Exam',
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Card title={<h2 className="text-2xl font-bold">Create New Exam</h2>} className="rounded-2xl shadow-sm">
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Exam Title" name="title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Midterm Physics 101" className="h-10" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} placeholder="Briefly describe the exam..." />
                    </Form.Item>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Form.Item label="Exam Validity Period" name="dateRange" rules={[{ required: true }]}>
                            <RangePicker className="w-full h-10" showTime />
                        </Form.Item>

                        <Form.Item label="Time Limit (Minutes)" name="timeLimitMinutes" rules={[{ required: true }]}>
                            <InputNumber min={1} className="w-full h-10 flex items-center" />
                        </Form.Item>
                    </div>

                    <Form.Item label="Authorized Emails (Optional, comma separated)" name="authorizedEmails">
                        <Input placeholder="user1@gmail.com, user2@gmail.com" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button onClick={() => navigate('/dashboard')}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading} className="h-10 px-8">
                            Create Exam
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default CreateExam;

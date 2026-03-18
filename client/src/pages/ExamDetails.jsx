import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tabs, Tag, Space, notification, Skeleton } from 'antd';
import { PlusOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import examService from '../services/examService';
import QuestionList from '../components/Question/QuestionList';
import QuestionForm from '../components/Question/QuestionForm';

const ExamDetails = () => {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const navigate = useNavigate();

    const fetchExam = async () => {
        try {
            const res = await examService.getExamById(id);
            setExam(res);
        } catch (err) { } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExam();
    }, [id]);

    const handlePublish = async () => {
        try {
            await examService.publishExam(id);
            notification.success({ message: 'Exam published! It can no longer be edited.' });
            fetchExam();
        } catch (err) { }
    };

    if (loading) return <div className="p-10"><Skeleton active /></div>;

    const tabsItems = [
        {
            key: '1',
            label: 'Questions',
            children: (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Questions List</h3>
                        {exam.status === 'draft' && (
                            <Button 
                                type="dashed" 
                                icon={<PlusOutlined />} 
                                onClick={() => setShowQuestionForm(true)}
                            >
                                Add Question
                            </Button>
                        )}
                    </div>
                    
                    <QuestionList examId={id} editable={exam.status === 'draft'} />
                    
                    {showQuestionForm && (
                        <QuestionForm 
                            examId={id} 
                            onClose={() => setShowQuestionForm(false)} 
                            onSuccess={() => {
                                setShowQuestionForm(false);
                                // The list will re-fetch or state update could happen here
                                window.location.reload(); // Simple way for now
                            }} 
                        />
                    )}
                </div>
            )
        },
        {
            key: '2',
            label: 'Settings/Preview',
            children: (
                <div className="space-y-4">
                    <p><strong>Access Code:</strong> <Tag color="blue">{exam.accessCode}</Tag></p>
                    <p><strong>Duration:</strong> {exam.timeLimitMinutes} minutes</p>
                    <p><strong>Start:</strong> {new Date(exam.startDate).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(exam.endDate).toLocaleString()}</p>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/dashboard')} 
                className="mb-4"
            >
                Back to Dashboard
            </Button>
            
            <Card className="rounded-2xl shadow-sm border-none mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{exam.title}</h1>
                            <Tag color={exam.status === 'published' ? 'green' : 'orange'}>
                                {exam.status.toUpperCase()}
                            </Tag>
                        </div>
                        <p className="text-slate-500">{exam.description}</p>
                    </div>
                    
                    {exam.status === 'draft' && (
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />} 
                            size="large"
                            className="bg-green-600 border-none"
                            onClick={handlePublish}
                        >
                            Publish Exam
                        </Button>
                    )}
                </div>
            </Card>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Tabs items={tabsItems} />
            </div>
        </div>
    );
};

export default ExamDetails;

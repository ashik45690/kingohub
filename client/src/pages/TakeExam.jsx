import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Radio, Space, notification, Progress, Spin } from 'antd';
import { ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import examService from '../services/examService';
import submissionService from '../services/submissionService';
import Timer from '../components/common/Timer';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startTime] = useState(new Date());

    const fetchExamData = useCallback(async () => {
        try {
            const [examRes, questionsRes] = await Promise.all([
                examService.getExamById(id),
                examService.getQuestions(id)
            ]);
            setExam(examRes);
            const normalizedQuestions = (questionsRes || []).map((q) => {
                if (Array.isArray(q.options)) {
                    return {
                        ...q,
                        options: {
                            A: q.options[0] ?? '',
                            B: q.options[1] ?? '',
                            C: q.options[2] ?? '',
                            D: q.options[3] ?? ''
                        }
                    };
                }
                return q;
            });
            setQuestions(normalizedQuestions);
            setLoading(false);
        } catch (err) {
            navigate('/dashboard');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) {
                return prev.map(a => a.questionId === questionId ? { ...a, selectedAnswer } : a);
            }
            return [...prev, { questionId, selectedAnswer }];
        });
    };

    const handleSubmit = async (status = 'completed') => {
        try {
            const toIndex = (val) => {
                if (typeof val === 'number') return val;
                const letter = String(val || '').toUpperCase();
                if (['A', 'B', 'C', 'D'].includes(letter)) {
                    return letter.charCodeAt(0) - 65;
                }
                return -1;
            };
            const payload = {
                examId: id,
                answers: answers.map((a) => ({
                    ...a,
                    selectedAnswer: toIndex(a.selectedAnswer)
                })),
                startTime,
                status
            };
            await submissionService.submitExam(payload);
            notification.success({ 
                message: status === 'auto-submitted' ? 'Exam Auto-Submitted' : 'Exam Submitted Successfully!',
                description: 'You can now view your results.'
            });
            navigate(`/result/${id}`);
        } catch (err) { }
    };

    if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
                <Card className="rounded-2xl border-none shadow-sm sticky top-20 z-10 md:hidden bg-blue-50">
                    <Timer 
                        minutes={exam.timeLimitMinutes} 
                        onExpire={() => handleSubmit('auto-submitted')} 
                    />
                </Card>

                <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
                
                {questions.map((q, idx) => (
                    <Card key={q._id} className="rounded-2xl shadow-sm border border-slate-100 p-2">
                        <div className="text-lg font-medium mb-4">
                            <span className="text-blue-600 mr-2">Question {idx + 1}.</span>
                            {q.questionText}
                        </div>
                        <Radio.Group 
                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                            value={answers.find(a => a.questionId === q._id)?.selectedAnswer}
                            className="w-full"
                        >
                            <Space direction="vertical" className="w-full">
                                <Radio value="A" className="p-3 border border-slate-50 w-full rounded-xl hover:bg-blue-50 transition-colors">
                                    <span className="font-semibold mr-2">A.</span> {q.options.A}
                                </Radio>
                                <Radio value="B" className="p-3 border border-slate-50 w-full rounded-xl hover:bg-blue-50 transition-colors">
                                    <span className="font-semibold mr-2">B.</span> {q.options.B}
                                </Radio>
                                <Radio value="C" className="p-3 border border-slate-50 w-full rounded-xl hover:bg-blue-50 transition-colors">
                                    <span className="font-semibold mr-2">C.</span> {q.options.C}
                                </Radio>
                                <Radio value="D" className="p-3 border border-slate-50 w-full rounded-xl hover:bg-blue-50 transition-colors">
                                    <span className="font-semibold mr-2">D.</span> {q.options.D}
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Card>
                ))}

                <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    size="large" 
                    className="w-full h-14 rounded-2xl bg-blue-600 font-bold"
                    onClick={() => handleSubmit('completed')}
                >
                    Submit Exam
                </Button>
            </div>

            <div className="hidden md:block w-72 h-auto">
                <div className="sticky top-24 space-y-6">
                    <Card className="rounded-2xl border-none shadow-md bg-white p-2">
                        <Timer 
                            minutes={exam.timeLimitMinutes} 
                            onExpire={() => handleSubmit('auto-submitted')} 
                        />
                    </Card>
                    
                    <Card className="rounded-2xl border-none shadow-sm bg-white p-2">
                        <h4 className="font-bold mb-4">Progress</h4>
                        <Progress 
                            type="circle" 
                            percent={Math.round((answers.length / questions.length) * 100)} 
                            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        />
                        <div className="mt-4 text-slate-500 text-sm">
                            {answers.length} of {questions.length} answered
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TakeExam;

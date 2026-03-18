import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Result, Button, Statistic, Row, Col, Progress } from 'antd';
import { CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import submissionService from '../services/submissionService';
import { useAuth } from '../context/AuthContext';

const ExamResults = () => {
    const { id } = useParams(); // examId
    const { user } = useAuth();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await submissionService.getUserSubmission(id, user._id);
                setSubmission(res);
            } catch (err) { } finally {
                setLoading(false);
            }
        };
        if (user) fetchResult();
    }, [id, user]);

    if (loading) return null;
    if (!submission) return <Result status="404" title="No submission found" />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="rounded-3xl shadow-xl overflow-hidden border-none text-center p-8">
                <Result
                    status="success"
                    title={<h1 className="text-3xl font-bold">Exam Completed!</h1>}
                    subTitle={`You have successfully submitted the ${submission.examId.title} exam.`}
                />

                <div className="mt-8 bg-slate-50 p-10 rounded-3xl border border-slate-100">
                    <Row gutter={[16, 24]} justify="center">
                        <Col xs={24} sm={8}>
                            <Statistic title="Score" value={submission.score} suffix={`/ ${submission.totalQuestions}`} />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic title="Percentage" value={submission.percentage} suffix="%" />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic title="Time Taken" value={Math.floor(submission.timeTaken / 60)} suffix=" mins" />
                        </Col>
                    </Row>

                    <div className="mt-12 flex justify-center">
                        <Progress 
                            type="dashboard" 
                            percent={submission.percentage} 
                            strokeColor={submission.percentage >= 50 ? '#52c41a' : '#f5222d'}
                            width={200}
                        />
                    </div>
                </div>

                <div className="mt-10 gap-4 flex flex-col sm:flex-row justify-center">
                    <Link to="/dashboard">
                        <Button type="primary" size="large" icon={<DashboardOutlined />} className="h-12 px-8 rounded-xl bg-blue-600">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button size="large" className="h-12 px-8 rounded-xl">
                            Back Home
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default ExamResults;

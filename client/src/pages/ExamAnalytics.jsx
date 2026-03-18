import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Spin, Tabs } from 'antd';
import { UserOutlined, TrophyOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import examService from '../services/examService';

const ExamAnalytics = () => {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await examService.getAnalytics(id);
                setAnalytics(res);
            } catch (err) { } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [id]);

    if (loading) return <div className="p-20 flex justify-center"><Spin size="large" /></div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const columns = [
        { title: 'Student Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Score', dataIndex: 'score', key: 'score', sorter: (a, b) => a.score - b.score },
        { title: 'Percentage', dataIndex: 'percentage', key: 'percentage', render: (val) => `${val}%` },
    ];

    const chartData = (analytics.students || []).map(s => ({
        name: s.name,
        score: s.score
    }));

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Exam Analytics</h1>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm rounded-xl">
                        <Statistic title="Total Students" value={analytics.totalStudents} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm rounded-xl">
                        <Statistic title="Average Score" value={analytics.averageScore} prefix={<RiseOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm rounded-xl">
                        <Statistic title="Highest Score" value={analytics.highestScore} prefix={<TrophyOutlined />} className="text-green-600" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm rounded-xl">
                        <Statistic title="Lowest Score" value={analytics.lowestScore} prefix={<FallOutlined />} className="text-red-600" />
                    </Card>
                </Col>
            </Row>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card title="Score Distribution" className="shadow-sm rounded-xl border-none">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Student Submissions" className="shadow-sm rounded-xl border-none">
                    <Table 
                        dataSource={analytics.students} 
                        columns={columns} 
                        rowKey="_id" 
                        pagination={{ pageSize: 5 }} 
                    />
                </Card>
            </div>
        </div>
    );
};

export default ExamAnalytics;

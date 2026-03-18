import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Skeleton } from 'antd';
import examService from '../../services/examService';

const QuestionList = ({ examId, editable }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await examService.getQuestions(examId);
                setQuestions(Array.isArray(res) ? res : []);
            } catch (err) { } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [examId]);

    if (loading) return <Skeleton active />;

    return (
        <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={questions}
            renderItem={(item, index) => (
                <List.Item>
                    <Card size="small" className="border border-slate-200">
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-700">Q{index + 1}: {item.questionText}</span>
                            <Tag color="green">Ans: {item.correctAnswer}</Tag>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-slate-500">
                            <div>A: {item.options.A}</div>
                            <div>B: {item.options.B}</div>
                            <div>C: {item.options.C}</div>
                            <div>D: {item.options.D}</div>
                        </div>
                    </Card>
                </List.Item>
            )}
        />
    );
};

export default QuestionList;

import React from 'react';

interface StatCardProps {
    value: string | number;
    label: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ value, label, loading = false }) => {
    if (loading) {
        return (
            <div className="text-center">
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
                {value}
            </div>
            <div className="text-lg text-gray-600">{label}</div>
        </div>
    );
});

StatCard.displayName = 'StatCard';

export default StatCard;

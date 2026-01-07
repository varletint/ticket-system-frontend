const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const spinner = (
        <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;

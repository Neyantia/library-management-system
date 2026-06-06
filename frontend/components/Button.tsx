
type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    className?: string;
    style?: React.CSSProperties;
};

export default function Button({
    children,
    onClick,
    type = "button",
    className = "",
    style,
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`custom-button ${className}`}
            style={style}
        >
            {children}
        </button>
    );
}
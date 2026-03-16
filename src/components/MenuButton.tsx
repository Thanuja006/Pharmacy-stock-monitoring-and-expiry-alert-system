interface MenuButtonProps {
  number: number;
  label: string;
  onClick: () => void;
}

const MenuButton = ({ number, label, onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-1 px-2 rounded hover:bg-secondary transition-colors text-foreground hover:text-primary text-sm"
    >
      [{number}] {label}
    </button>
  );
};

export default MenuButton;

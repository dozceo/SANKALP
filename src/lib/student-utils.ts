export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
];

export const getAvatarColor = (grade?: number) => {
    return AVATAR_COLORS[(grade || 0) % AVATAR_COLORS.length];
};


export default interface IJwtPayload {
    name: string;
    id: string;
    role: string;
    email: string;
    type: 'access' | 'refresh';
}
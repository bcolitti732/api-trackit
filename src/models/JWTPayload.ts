
export default interface IJwtPayload {
    name: string;
    id: string;
    role: string;
    type: 'access' | 'refresh';
}
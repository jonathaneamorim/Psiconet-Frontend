export enum RoleEnum {
    ADMIN = 'admin',
    PSYCHOLOGIST = 'psychologist',
    PATIENT = 'patient'
}


const RoleLabels: Record<RoleEnum, string> = {
    [RoleEnum.ADMIN]: 'Administrador',
    [RoleEnum.PSYCHOLOGIST]: 'Psicólogo',
    [RoleEnum.PATIENT]: 'Paciente',
};

export const translateRole = (role: RoleEnum | string): string => {
    return RoleLabels[role as RoleEnum] || role;
};
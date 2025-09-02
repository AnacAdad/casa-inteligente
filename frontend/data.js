export const dispositivosPorComodo = {
    'Sala de Estar': ['Luz', 'Ar-condicionado', 'TV'],
    'Quarto': ['Luz', 'TV', 'Ar-condicionado', 'Cortina', 'Abajur'],
    'Cozinha': ['Luz'],
    'Banheiro': ['Luz'],
    'Jardim': ['Luz'],
    'Área de Lazer': ['Luz', 'Som'],
    'Garagem': ['Luz']
};

export const cenas = {
    'Cinema': [
        { comodo: 'Sala de Estar', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Sala de Estar', dispositivo: 'Ar-condicionado', estado: 'Ligado' },
        { comodo: 'Sala de Estar', dispositivo: 'TV', estado: 'Ligado' }
    ],
    'Dormir': [
        { comodo: 'Quarto', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'TV', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'Ar-condicionado', estado: 'Ligado' },
        { comodo: 'Quarto', dispositivo: 'Cortina', estado: 'Fechado' }
    ],
    'Acordar': [
        { comodo: 'Quarto', dispositivo: 'Cortina', estado: 'Aberto' },
        { comodo: 'Quarto', dispositivo: 'Ar-condicionado', estado: 'Desligado' }
    ],
    'Leitura': [
        { comodo: 'Quarto', dispositivo: 'Abajur', estado: 'Ligado' },
        { comodo: 'Quarto', dispositivo: 'Ar-condicionado', estado: 'Ligado' },
        { comodo: 'Quarto', dispositivo: 'Luz', estado: 'Desligado' }
    ],
    'Festa': [
        { comodo: 'Área de Lazer', dispositivo: 'Luz', estado: 'Ligado' },
        { comodo: 'Jardim', dispositivo: 'Luz', estado: 'Ligado' },
        { comodo: 'Área de Lazer', dispositivo: 'Som', estado: 'Ligado' }
    ],
    'Chegar em casa': [
        { comodo: 'Garagem', dispositivo: 'Luz', estado: 'Ligado' },
        { comodo: 'Sala de Estar', dispositivo: 'Luz', estado: 'Ligado' },
        { comodo: 'Jardim', dispositivo: 'Luz', estado: 'Ligado' },
        { comodo: 'Sala de Estar', dispositivo: 'Ar-condicionado', estado: 'Ligado' }
    ],
    'Sair de casa': [
        { comodo: 'Sala de Estar', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Cozinha', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Banheiro', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Garagem', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Jardim', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Área de Lazer', dispositivo: 'Luz', estado: 'Desligado' },
        { comodo: 'Sala de Estar', dispositivo: 'Ar-condicionado', estado: 'Desligado' },
        { comodo: 'Sala de Estar', dispositivo: 'TV', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'TV', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'Ar-condicionado', estado: 'Desligado' },
        { comodo: 'Quarto', dispositivo: 'Cortina', estado: 'Fechado' },
        { comodo: 'Quarto', dispositivo: 'Abajur', estado: 'Desligado' },
        { comodo: 'Área de Lazer', dispositivo: 'Som', estado: 'Desligado' }
    ]
};

export const estadoDispositivos = {};

export const comodoClasses = {
    'Sala de Estar': 'sala-estar',
    'Quarto': 'quarto',
    'Cozinha': 'cozinha',
    'Banheiro': 'banheiro',
    'Jardim': 'jardim',
    'Área de Lazer': 'area-lazer',
    'Garagem': 'garagem'
};
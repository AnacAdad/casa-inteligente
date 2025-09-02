CREATE TABLE comodo (
	cod_comodo SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(50) NOT NULL
);

CREATE TABLE dispositivo(
	cod_dispositivo SERIAL NOT NULL PRIMARY KEY,
	cod_comodo INT NOT NULL REFERENCES comodo(cod_comodo),
	nome VARCHAR(50) NOT NULL,
	status BOOLEAN DEFAULT false
);

CREATE TABLE cena (
	cod_cena SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(50) NOT NULL,
	ativa BOOLEAN DEFAULT false
);

CREATE TABLE acao (
	cod_acao SERIAL NOT NULL PRIMARY KEY,
	acao VARCHAR(50) NOT NULL
);

CREATE TABLE acao_dispositivo(
	cod_acao INT NOT NULL REFERENCES acao(cod_acao),
	cod_dispositivo INT NOT NULL REFERENCES dispositivo(cod_dispositivo)
);

CREATE TABLE acao_cena (
	cod_acao_cena SERIAL NOT NULL PRIMARY KEY,
	cod_cena INT NOT NULL REFERENCES cena(cod_cena),
	cod_acao INT NOT NULL REFERENCES acao(cod_acao),
	ordem INT NOT NULL,
	intervalo INT NOT NULL
);
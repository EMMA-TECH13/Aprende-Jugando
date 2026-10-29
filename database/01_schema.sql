CREATE DATABASE IF NOT EXISTS aprende_jugando CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aprende_jugando;
CREATE TABLE IF NOT EXISTS estudiantes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 edad TINYINT UNSIGNED NOT NULL,
 creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT chk_edad CHECK (edad BETWEEN 3 AND 17)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS actividades (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 codigo VARCHAR(30) NOT NULL UNIQUE,
 nombre VARCHAR(80) NOT NULL,
 nivel ENUM('Preprimaria','Primaria') NOT NULL,
 descripcion VARCHAR(220) NOT NULL,
 orden TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS partidas (
 id CHAR(36) PRIMARY KEY,
 estudiante_id INT UNSIGNED NOT NULL,
 actividad_id INT UNSIGNED NOT NULL,
 contenido JSON NOT NULL,
 creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
 FOREIGN KEY (actividad_id) REFERENCES actividades(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS resultados (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 partida_id CHAR(36) NOT NULL UNIQUE,
 estudiante_id INT UNSIGNED NOT NULL,
 actividad_id INT UNSIGNED NOT NULL,
 puntaje TINYINT UNSIGNED NOT NULL,
 aciertos SMALLINT UNSIGNED NOT NULL,
 intentos SMALLINT UNSIGNED NOT NULL,
 total SMALLINT UNSIGNED NOT NULL,
 duracion_segundos INT UNSIGNED NOT NULL,
 fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (partida_id) REFERENCES partidas(id),
 FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
 FOREIGN KEY (actividad_id) REFERENCES actividades(id),
 CONSTRAINT chk_puntaje CHECK (puntaje <= 100),
 INDEX idx_estudiante_fecha (estudiante_id, fecha),
 INDEX idx_fecha (fecha)
) ENGINE=InnoDB;
INSERT INTO actividades(codigo,nombre,nivel,descripcion,orden) VALUES
('espacio','Explora el espacio','Preprimaria','Adentro, afuera, arriba, abajo, cerca, lejos, encima y debajo.',1),
('figuras','Descubre las figuras','Preprimaria','Reconoce círculos, cuadrados, triángulos y rectángulos.',2),
('memoria','Encuentra los pares','Preprimaria','Descubre las tarjetas y encuentra seis parejas.',3),
('tablas','Reto de multiplicar','Primaria','Practica las tablas del 1 al 10.',4),
('fracciones','Suma de fracciones','Primaria','Suma fracciones con denominadores iguales y diferentes.',5),
('decimales','Multiplica decimales','Primaria','Resuelve multiplicaciones con una cifra decimal.',6)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),descripcion=VALUES(descripcion),nivel=VALUES(nivel),orden=VALUES(orden);

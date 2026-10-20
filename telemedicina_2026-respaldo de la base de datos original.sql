-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-09-2026 a las 17:43:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `telemedicina_2026`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(50) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'termómetros'),
(2, 'estetoscopios'),
(3, 'sillas de ruedas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestores`
--

CREATE TABLE `gestores` (
  `id` int(50) NOT NULL,
  `login` varchar(50) NOT NULL,
  `contrasenya` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gestores`
--

INSERT INTO `gestores` (`id`, `login`, `contrasenya`, `nombre`, `apellidos`) VALUES
(1, 'santi', 'pato', 'santiago', 'ferreira'),
(2, 'elsa', 'patosa', 'elsa', 'fonts'),
(3, 'victor', 'cerveza', 'victor', 'sanchez');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id` int(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `categoria` int(50) NOT NULL,
  `horas_maximas` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id`, `nombre`, `categoria`, `horas_maximas`) VALUES
(1, 'termometro1', 1, 4),
(2, 'termometro2', 1, 6),
(3, 'estetoscopio1', 2, 8),
(4, 'estetoscopio2', 2, 10),
(5, 'silla 1', 3, 24),
(6, 'silla 2', 3, 48);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id` int(50) NOT NULL,
  `numero_serie` int(50) NOT NULL,
  `categoria` int(50) NOT NULL,
  `modelo` int(50) NOT NULL,
  `ubicacion` int(50) NOT NULL,
  `estado` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recursos`
--

INSERT INTO `recursos` (`id`, `numero_serie`, `categoria`, `modelo`, `ubicacion`, `estado`) VALUES
(1, 454554, 1, 1, 2, 0),
(2, 36534, 1, 1, 3, 0),
(3, 353534, 2, 3, 2, 0),
(4, 26344, 2, 3, 3, 2),
(5, 42422, 2, 4, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenyas`
--

CREATE TABLE `resenyas` (
  `id` int(50) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `sanitario` int(50) NOT NULL,
  `valor` int(50) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `recurso` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resenyas`
--

INSERT INTO `resenyas` (`id`, `fecha`, `sanitario`, `valor`, `descripcion`, `recurso`) VALUES
(1, '2026-02-10 08:00:00', 1, 3, 'Chequeo general', 1),
(2, '2026-02-11 09:30:00', 2, 5, 'Limpieza profunda de equipo', 2),
(3, '2026-02-12 11:15:00', 3, 2, 'Ajuste de válvula', 3),
(4, '2026-02-13 14:00:00', 4, 4, 'Revisión de conexiones', 4),
(5, '2026-02-14 08:45:00', 5, 1, 'Cambio de filtros', 5),
(7, '2026-02-16 12:00:00', 1, 2, 'Limpieza de área de trabajo', 1),
(8, '2026-02-17 09:15:00', 2, 5, 'Verificar protocolos', 2),
(9, '2026-02-18 13:45:00', 3, 4, 'Sustituir componentes dañados', 3),
(10, '2026-02-19 11:30:00', 4, 1, 'Comprobación general del sistema', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(50) NOT NULL,
  `sanitario` int(50) NOT NULL,
  `horas_estimadas` int(50) NOT NULL,
  `fecha_peticion` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `recurso` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `sanitario`, `horas_estimadas`, `fecha_peticion`, `fecha_inicio`, `fecha_fin`, `recurso`) VALUES
(1, 3, 15, '2026-02-10 09:15:00', NULL, NULL, 1),
(2, 2, 2, '2026-02-12 10:30:00', '2026-02-20 09:00:00', '2026-02-20 10:30:00', 1),
(4, 6, 1, '2026-02-14 14:20:00', '2026-02-15 10:00:00', '2026-02-15 11:00:00', 5),
(7, 3, 50, '2026-02-15 08:00:00', '2026-02-25 09:00:00', '2026-02-25 11:30:00', 1),
(11, 6, 12, '2026-02-19 08:00:00', '2026-02-20 07:00:00', '2026-02-24 20:00:00', 5),
(13, 1, 10, '2026-02-10 09:15:00', NULL, NULL, 1),
(14, 7, 3, '2026-02-10 09:15:00', NULL, NULL, 1),
(15, 1, 12, '2026-02-10 09:15:00', '2026-05-08 12:00:00', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sanitarios`
--

CREATE TABLE `sanitarios` (
  `id` int(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sanitarios`
--

INSERT INTO `sanitarios` (`id`, `nombre`, `apellidos`, `usuario`, `password`) VALUES
(1, 'Carlos', 'Pérez Gómez', 'c', 'c'),
(2, 'María', 'Rodríguez López', 'mrodriguez', 'clave456'),
(3, 'Luis', 'Fernández Ruiz', 'lfernandez', 'abc789'),
(4, 'Ana', 'Martínez Díaz', 'amartinez', 'segura321'),
(5, 'Javier', 'Sánchez Torres', 'jsanchez', 'medico654'),
(6, 'Elena', 'García Navarro', 'egarcia', 'hospital987'),
(7, 'Santiago', 'Ferreira', 'santi', 'pato');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(50) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`) VALUES
(1, 'salas'),
(2, 'laboratorios'),
(3, 'almacenes');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gestores`
--
ALTER TABLE `gestores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelos-->categorias` (`categoria`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria de recurso` (`categoria`),
  ADD KEY `modelo del recurso` (`modelo`),
  ADD KEY `ubicacion del recurso` (`ubicacion`);

--
-- Indices de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sanitario de la resenya` (`sanitario`),
  ADD KEY `recurso de la resenya` (`recurso`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sanitario de la reserva` (`sanitario`),
  ADD KEY `recurso de la reserva` (`recurso`);

--
-- Indices de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `gestores`
--
ALTER TABLE `gestores`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `modelos-->categorias` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD CONSTRAINT `categoria de recurso` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `modelo del recurso` FOREIGN KEY (`modelo`) REFERENCES `modelos` (`id`),
  ADD CONSTRAINT `ubicacion del recurso` FOREIGN KEY (`ubicacion`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD CONSTRAINT `recurso de la resenya` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `sanitario de la resenya` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `recurso de la reserva` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `sanitario de la reserva` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

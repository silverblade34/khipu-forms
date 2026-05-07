# 🦙 Khipu Forms - Smart SaaS Form Engine

Khipu Forms es una plataforma SaaS de última generación diseñada para transformar la recolección de datos estática en una experiencia interactiva, gamificada y profesional. Ideal para investigadores, educadores y empresas que buscan un engagement superior en sus encuestas y exámenes.

![Khipu Banner](https://raw.githubusercontent.com/michellmarcosp/portafolio/main/khipu-forms/public/banner.png)

## 🚀 Características Principales

### 🎮 Motor de Gamificación Avanzado (Interactive Pro)
Khipu Forms no solo recolecta datos, enseña y entretiene.
- **Sistema de Vidas (Initial Lives)**: Configura un límite de errores para exámenes de certificación.
- **Rachas y Puntuación**: Recompensas visuales por respuestas correctas consecutivas.
- **Feedback Inmediato**: La mascota "Llama Khipu" reacciona en tiempo real a las respuestas.
- **Fundamentación Pedagógica**: Permite añadir explicaciones detalladas para cada respuesta correcta o incorrecta.

### 🎨 Modos de Presentación Dinámicos
Adapta la visualización al propósito de tu formulario:
- **Modo Clásico**: Vista tradicional de lista para encuestas rápidas.
- **Modo Secuencial (Cards)**: Enfoque paso a paso para reducir la carga cognitiva.
- **Modo Interactivo Pro**: Experiencia gamificada tipo Duolingo con feedback animado.

### 🛠️ Builder de Alto Nivel
- **Organización por Acordeones**: Interfaz limpia que agrupa Preguntas, Configuración, Gamificación y Privacidad.
- **Pistas Inteligentes (Hints)**: Inyecta pistas opcionales que el usuario puede desbloquear antes de responder.
- **Temporizadores por Pregunta**: Control estricto de tiempo para validación de conocimientos.

### 📱 Diseño Mobile-First & Responsive
- **Chalkboard Lesson System**: Interfaz de "Pizarra Educativa" que se adapta automáticamente a pantallas verticales.
- **TopBar de Gamificación**: Visualización clara de racha, puntos y vidas en cualquier dispositivo.
- **Temporizador en Tiempo Real**: Reloj tipo "pill" flotante con alertas de urgencia visual.

## 🎯 Casos de Uso y Plantillas Inteligentes

Khipu Forms incluye un motor de plantillas diseñado para demostrar todo el potencial de la plataforma en diferentes verticales:

### 🎓 Educación: Examen de Certificación
Ideal para validar conocimientos técnicos.
- **Configuración**: Modo Interactivo Pro + Gamificación.
- **Lógica**: Inicia con **5 vidas**. Cada error resta una vida y muestra una **fundamentación técnica** para reforzar el aprendizaje.
- **Meta**: Los estudiantes deben llegar al final antes de perder todas las vidas para obtener su score.

### 🧠 Entretenimiento: Trivia de Cultura
Diseñado para engagement y fidelización.
- **Configuración**: Modo Secuencial + Pistas Activadas.
- **Lógica**: Cada pregunta incluye una **pista (Hint)** opcional que el usuario puede desbloquear si tiene dudas, junto con un sistema de puntos acumulables.
- **Meta**: Generar una experiencia divertida y competitiva.

### 📈 Marketing: Captura de Leads Pro
Optimizado para altas tasas de conversión.
- **Configuración**: Modo Secuencial (Cards).
- **Lógica**: Presenta una pregunta a la vez para evitar la fatiga del usuario. No usa gamificación para mantener el enfoque en la recolección de datos limpia.
- **Meta**: Maximizar la captura de correos electrónicos y datos de contacto.

### 🏢 Corporativo: Encuesta de Satisfacción
Análisis profundo de la experiencia del cliente.
- **Configuración**: Modo Clásico + Campos Obligatorios.
- **Lógica**: Estructura profesional de lista que permite al usuario revisar todas sus respuestas antes de enviar. Incluye mensajes de cierre personalizados basados en el éxito del formulario.
- **Meta**: Obtener datos estructurados para análisis de métricas NPS.

## 🏗️ Stack Tecnológico
- **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS para diseño premium.
- **Estado**: Zustand (Builder Store) para una edición en tiempo real sin latencia.
- **Backend**: Next.js API Routes con persistencia en base de datos relacional.
- **Diseño**: Sistema de diseño personalizado con enfoque en micro-animaciones y estética profesional.

## 📋 Resumen Funcional para Producción
1. **Templates Inteligentes**: Galería de plantillas con 5+ preguntas pre-configuradas (Trivia, Lead Capture, NPS, Certificación).
2. **Persistencia Total**: Los modos de presentación y flags de gamificación se sincronizan instantáneamente con la base de datos.
3. **White Label Friendly**: Estructura lista para personalización de marca y logos (Informed Consent incluido).
4. **Validación Robusta**: Manejo de códigos de acceso, emails obligatorios y duplicidad de respuestas.

## 🛠️ Instalación y Desarrollo

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno (.env)
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---
Desarrollado con ❤️ por **Michell Marcos** para la próxima generación de recolección de datos.

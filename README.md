# FIFA League App

Una aplicación web para organizar ligas de fútbol entre amigos, desarrollada con Next.js 15, React 19, TypeScript y TailwindCSS.

## 🚀 Características

- **Gestión de Ligas**: Crea y administra ligas personalizadas
- **Configuración Flexible**: 
  - Selecciona jugadores predefinidos o agrega jugadores personalizados
  - Asigna equipos de fútbol a cada jugador
  - Opción de liga de ida y vuelta
  - Sistema de playoffs opcional
- **Seguimiento de Estadísticas**: 
  - Tabla de posiciones automática
  - Estadísticas detalladas por jugador
  - Histórial de partidos
- **Interfaz Moderna**: UI limpia y responsiva con componentes de shadcn/ui
- **Persistencia Local**: Los datos se guardan en localStorage

## 🛠 Tecnologías

- **Framework**: Next.js 15
- **Frontend**: React 19, TypeScript
- **Styling**: TailwindCSS, tw-animate-css
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Fonts**: Geist (Sans & Mono)
- **Analytics**: Vercel Analytics

## 📋 Requisitos Previos

- Node.js 18+ 
- npm

## 🚦 Instalación y Configuración

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd league-app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Ejecuta en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador en:**
   ```
   http://localhost:3000
   ```

## 📝 Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## 🎯 Próximas Características

- [ ] Integración con Supabase para persistencia de datos
- [ ] Sistema de usuarios (sin autenticación compleja)
- [ ] Estadísticas avanzadas y gráficos
- [ ] Historial de ligas anteriores
- [ ] Export/Import de datos de liga
- [ ] Sistema de notificaciones

## 🏗 Arquitectura Planeada

### Componentización (Próximo Sprint)
- [ ] Separar `page.tsx` en componentes más pequeños
- [ ] Extraer hooks personalizados
- [ ] Mover utilidades a `lib/utils.ts`

### Base de Datos (Próximo Sprint)
- [ ] Configurar Supabase
- [ ] Crear esquemas para:
  - Ligas
  - Jugadores
  - Partidos
  - Estadísticas
- [ ] API routes para CRUD operations

## 🤝 Contribución

Este es un proyecto personal para uso entre amigos. Si tienes sugerencias o mejoras, siéntete libre de crear un issue o pull request.

## 📄 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Nota**: Esta aplicación está diseñada para uso personal y no requiere sistema de autenticación complejo.

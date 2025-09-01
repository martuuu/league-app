# FIFA League App

Una aplicación web para organizar ligas de fútbol entre amigos, desarrollada con Next.js 15, React 19, TypeScript y TailwindCSS.

## 🚀 Características

- **Gestión de Ligas**: Crea y administra ligas personalizadas
- **Dashboard de Estadísticas**: Vista global de todas tus ligas con widgets informativos
- **Configuración Flexible**: 
  - Selecciona jugadores predefinidos o agrega jugadores personalizados
  - Asigna equipos de fútbol a cada jugador
  - Opción de liga de ida y vuelta
  - Sistema de playoffs opcional (2, 4, 6, 8 equipos)
- **Seguimiento de Estadísticas**: 
  - Tabla de posiciones automática
  - Estadísticas detalladas por jugador
  - Histórial de partidos
  - Hall of Fame con campeones
- **Sistema de Playoffs Completo**:
  - Brackets automáticos según número de equipos
  - Soporte para penales en empates
  - UI diferenciada para formato de 6 equipos
  - Efectos visuales para finalizaciones
- **Interfaz Moderna**: UI limpia y responsiva con componentes de shadcn/ui
- **Persistencia Local**: Los datos se guardan en localStorage (migración a BD planeada)

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

- [ ] **Sprint 3**: Integración con Supabase + Redux para persistencia de datos
- [ ] **Sincronización en tiempo real** entre múltiples usuarios
- [ ] **Sistema de usuarios** (sin autenticación compleja)
- [ ] **Estadísticas avanzadas** y gráficos interactivos
- [ ] **Exportar/Importar** datos de liga
- [ ] **Notificaciones push** para actualizaciones

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

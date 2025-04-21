
Aplicación web para gestión de tareas dentro de una organización, desarrollada con:

- ⚙️ Backend: NestJS + Prisma + PostgreSQL
- 💻 Frontend: Next.js (App Router) + MUI + Tailwind CSS
- 🔐 Autenticación JWT
- 🧠 Multitenancy por organización
- 📝 Soft delete + historial de cambios

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/task-manager.git
cd task-manager
```

### 2. Variables de entorno

Copia el archivo `.env.template` a `.env` y configura las variables de entorno necesarias para tu entorno de desarrollo.

### 3. Instalar dependencias

```bash
npm install
```

### 4. Inicializar la base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Ejecutar la aplicación backend

```bash
cd backend
npm run start:dev
```

### 6. Ejecutar la aplicación frontend

```bash
cd frontend
npm run dev
```

import React, { useEffect, useState, useRef } from 'react';
import {Link,  useNavigate } from 'react-router-dom';
import '../../styles/style_usuarios.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import axios from 'axios';
import Header2 from '../../componentes/header2';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';


const UsuariosAdmin = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    correo_electronico: '',
    tipo_documento: '',
    num_documento: '',
    contrasena: '',
    rol: '',
    estado: 'Activo'
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [allowLetters, setAllowLetters] = useState(false);
  const navigate = useNavigate();
  const filterMenuRef = useRef(null);
  
  // Paginación
  const [currentPageUser, setCurrentPageUser] = useState(1);
  const recordsPerPage = 5;

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/usuario');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error al obtener los usuarios.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios según la búsqueda y el filtro de tipo de usuario
  const filteredUsers = users
  .filter((user) =>  
    user.num_doc.toString().includes(searchTerm)
  )
  .filter((user) => {
    if (userTypeFilter === 'UsuariosAdmin') {
      return user.rol !== 'Cliente';
    }
    return userTypeFilter === 'todos' || user.rol === userTypeFilter;
  });

  // Calcular el índice del primer y último registro para la página actual
  const indexOfLastRecordUser = currentPageUser * recordsPerPage;
  const indexOfFirstRecordUser = indexOfLastRecordUser - recordsPerPage;

  // Obtener los usuarios filtrados para la página actual
  const currentRecordsUser = filteredUsers.slice(indexOfFirstRecordUser, indexOfLastRecordUser);
  const totalPagesUser = Math.ceil(filteredUsers.length / recordsPerPage);

  // Cambiar de página
  const handlePageChangeUser = (pageNumber) => {
    setCurrentPageUser(pageNumber);
  };
  // Restrict non-numeric input in the name fields
const handleNameKeyPress = (e) => {
  // Only allow letters, spaces, and common name punctuation
  if (!/^[a-zA-Z\s]*$/.test(e.key)) {
    e.preventDefault();
  }
};

  

  // Handle input changes
  const handleInput = (e) => {
    const { id, value } = e.target;

    // Actualiza el estado del formulario
    if (id === "tipo_documento") {
        // Maneja el cambio en el tipo de documento
        setFormData((prevData) => ({
            ...prevData,
            tipo_documento: value,
            num_documento: '' // Resetea el campo de identificación
        }));

        // Verifica el tipo de documento seleccionado
        if (value === "cedula de extranjería") {
            setAllowLetters(true); // Permite letras y números
        } else {
            setAllowLetters(false); // Solo permite números para tarjeta y cédula
        }
    } else if (id === "num_documento") {
        // Maneja el cambio en el campo de identificación
        // Lógica para cédula (10 dígitos solo numéricos) y tarjeta (10 dígitos solo numéricos)
        if ((formData.tipo_documento === "cedula de ciudadania" || formData.tipo_documento === "tarjeta de identidad") && /^[0-9]{0,10}$/.test(value)) {
            setFormData((prevData) => ({ ...prevData, num_documento: value }));
        } 
        // Lógica para cédula de extranjería (10-12 caracteres alfanuméricos)
        else if (formData.tipo_documento === "cedula de extranjería" && /^[a-zA-Z0-9]{0,12}$/.test(value) && value.length <= 12) {
            setFormData((prevData) => ({ ...prevData, num_documento: value }));
        }
    } else {
        // Para otros campos, se actualiza normalmente
        setFormData({
            ...formData,
            [id]: value,
        });
    }
};


  // registro de usuarios admin

  const handleSubmit = (event) => {
    // Validación de campos requeridos
    const { nombres, apellidos, telefono, correo_electronico, tipo_documento, num_documento, contrasena, rol } = formData;
    
    if (!nombres || !apellidos || !telefono || !correo_electronico || !tipo_documento || !num_documento || !contrasena || !rol) {

    axios.post('http://localhost:4000/usuario', formData )
             }
  
          .then(res => console.log(res))
          .catch(err => console.log(err));
            }
          }
  
 
  
    if (isEditing && currentUser) {
      Swal.fire({
          title: '¿Desea continuar para guardar los cambios?',
          icon: 'warning',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          denyButtonText: 'No Guardar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
      }).then(async (result) => {
          if (result.isConfirmed) {
              try {
                  await axios.put(`http://localhost:4000/usuario/${currentUser.id}`, formData);
                  fetchUsers();
                  resetForm();
                  setIsEditing(false);
                  Swal.fire({
                      title: '¡Éxito!',
                      text: 'Usuario actualizado exitosamente.',
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false
                  }).then(() => {
                      navigate('/usuarios_admin.js');
                  });
              } catch (error) {
                  console.error('Error updating user:', error);
                  Swal.fire({
                      title: 'Error!',
                      text: 'Error al actualizar el usuario.',
                      icon: 'error',
                      timer: 2000,
                      showConfirmButton: false
                  });
              }
          } else if (result.isDenied) {
              Swal.fire({
                  title: 'Cambios no guardados',
                  text: 'Los cambios que has hecho no se guardaron.',
                  icon: 'info',
                  timer: 2000,
                  showConfirmButton: false
              }).then(() => {
                  navigate('/usuarios_admin.js');
              });
          }
      });
  } 

  // Edit user
  const handleEditUser = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData(user);
  };

  // Set user as inactive
  const handleSetInactiveUser = async (id) => {
    const confirmInactive = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El usuario será marcado como inactivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, inactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (confirmInactive.isConfirmed) {
      try {
        const response = await axios.get(`http://localhost:4000/usuario/${id}`);
        const usuarioActual = response.data;
        const usuarioActualizado = { ...usuarioActual, estado: 'Inactivo' };
        await axios.put(`http://localhost:4000/usuario/${id}`, usuarioActualizado);
        Swal.fire({
          title: '¡Inactivado!',
          text: 'Usuario marcado como inactivo exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          fetchUsers();
        });
      } catch (error) {
        console.error('Error setting user inactive:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Error al inactivar el usuario.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      telefono: '',
      correo_electronico: '',
      tipo_documento: '',
      num_documento: '',
      contrasena: '',
      rol: '',
      estado: 'Activo',
    });
    setCurrentUser(null);
    setIsEditing(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle user type filter change
  const handleUserTypeFilterChange = (e) => {
    setUserTypeFilter(e.target.value);
  };

// Nuevo manejador de eventos para evitar números
const handleKeyPress = (e) => {
  // Expresión regular para evitar números
  const regex = /[0-9]/;
  
  // Si el carácter presionado es un número, prevenir la entrada
  if (regex.test(e.key)) {
    e.preventDefault();
  }
};
  const renderUserTable = () => {
    return (
      <div className="table-container">
      <table className="table table-striped mt-4">
        <thead>
          <tr>
          <th>Nº Identificación</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Tipo de Documento</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Editar</th>
            <th>Desactivar</th>
          </tr>
        </thead>
        <tbody>
          {currentRecordsUser.map(user => (
            <tr key={user.num_documento}>
              <td>{user.num_documento}</td>
              <td>{user.nombres}</td>
              <td>{user.apellidos}</td>
              <td>{user.correo_electronico}</td>
              <td>{user.telefono}</td>
              <td>{user.tipo_documento}</td>
              <td>{user.rol}</td>
              <td>{user.estado}</td>
              <td>
                  <div className="center-buttons">
    <button
      type="button"
      className="button-style"
      data-bs-toggle="modal"
      data-bs-target="#registroUserModal"
      onClick={() => handleEditUser(user)}
    >
      <FontAwesomeIcon icon={faEdit} />
    </button>
  </div>
</td>
<td>
  <div className="center-buttons">
    <button
      type="button"
      className="button-style"
      onClick={() => handleSetInactiveUser(user.id)}
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    );
  };

  return (
    <div>
      <Header2 />
      <div className="container">
        <section className="container mt-5">
          <h2>Registro de usuarios</h2>
          <br />
          <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
            {/* Barra de búsqueda */}
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faSearch} className="me-2" style={{ fontSize: '20px' }} />
              <input
                type="text"
                id="searchInput"
                className="form-control"
                placeholder="Buscar Usuario"
                value={searchTerm}
                onChange={handleSearchChange}
                required
              />
              {/* Ícono de filtro */}
              <button
                type="button"
                className="btn btn-light ms-2 position-relative"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} style={{ fontSize: '20px' }} />
              </button>
              {showFilters && (
                <div ref={filterMenuRef} className="filter-menu position-absolute mt-2 p-2 bg-white border rounded shadow">
                  <select id="userTypeFilter" className="form-select" value={userTypeFilter} onChange={handleUserTypeFilterChange}>
                    <option value="todos">Todos</option>
                    <option value="UsuariosAdmin">UsuariosAdmin</option>
                    <option value="Cliente">Cliente</option>
                    </select>
            </div>
          )}
        </div>
    

       
            {/* Botón para abrir el modal */}
            <button
              type="button"
              className="btn btn-success"
              data-bs-toggle="modal"
              data-bs-target="#registroUserModal"
              onClick={resetForm}
            >
              Registrar Usuario
            </button>
            </div>
          <div className="modal fade" id="registroUserModal" tabIndex={-1} aria-labelledby="registroUserModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="registroUserModalLabel">Registrar Usuario</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>
                <div className="modal-body">
                  <form action="" onSubmit={handleSubmit}>
                    {/* Formulario de registro */}
                    <div className="mb-3">
                      <label htmlFor="tipo_documento" className="form-label">Tipo de Documento</label>
                      <select className="form-select" id="tipo_documento"  onChange={handleInput} required>
                        <option value="" disabled>Selecciona una opción</option>
                        <option value="cedula extranjeria">CE</option>
                        <option value="tarjeta de identidad">TI</option>
                        <option value="cedula de ciudadania">CC</option>
                        </select>
                        </div>
                    <div className="mb-3">
                      <label htmlFor="num_doc" className="form-label">Nº Identificación</label>
                      <input type="number" className="form-control" id="num_doc" placeholder="Ingrese Nº Identificación"  onChange={handleInput} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="nombres" className="form-label">Nombres</label>
                      <input type="text" className="form-control" id="nombres" placeholder="Ingrese Nombres"  onChange={handleInput} onKeyPress={handleNameKeyPress} required/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="apellidos" className="form-label">Apellidos</label>
                      <input type="text" className="form-control" id="apellidos" placeholder="Ingrese Apellidos"  onChange={handleInput} onKeyPress={handleKeyPress}required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="correo_electronico" className="form-label">Correo Electrónico</label>
                      <input type="email" className="form-control" id="correo_electronico" placeholder="Ingrese Correo Electrónico"  onChange={handleInput}required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label">Número Celular</label>
                      <input type="number" className="form-control" id="telefono" placeholder="Ingrese Número Celular"  onChange={handleInput} required/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contrasena" className="form-label">Contraseña</label>
                      <input type="password" className="form-control" id="contrasena" placeholder="Ingrese Contraseña"  onChange={handleInput} required/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="rol" className="form-label">Rol</label>
                      <select className="form-select" id="rol"  onChange={handleInput} required>
                        <option value="" disabled>Selecciona una opción</option>
                        <option value="domiciliario">Domiciliario</option>
                        <option value="jefe de produccion">Jf Producción</option>
                        <option value="Gerente">Gerente</option>
                        </select>
                </div>
              </form>
            </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Cerrar</button>
                  <button type="button" className="btn btn-success" onClick={handleSubmit}>
  {isEditing ? 'Guardar Cambios' : 'Guardar'}
</button>
                    
            </div>
          </div>
        </div>
      </div>
     
      {renderUserTable()}

{/* Paginación */}
<div className="d-flex justify-content-center mt-4">
  <nav>
  <ul className="pagination">
                          <li
                            className={`paginate_button page-item  ${
                              currentPageUser === 1 ? "disabled" : ""
                            }`}
                          >
                            <Link
                              onClick={() =>
                                handlePageChangeUser(currentPageUser - 1)
                              }
                              to="#"
                              className="page-link"
                            >
                              Anterior
                            </Link>
                          </li>
                          {[...Array(totalPagesUser)].map((_, index) => (
                            <li
                              key={index}
                              className={`paginate_button page-item ${
                                currentPageUser === index + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                onClick={() => handlePageChangeUser(index + 1)}
                                className="page-link"
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`paginate_button page-item next ${
                              currentPageUser === totalPagesUser ? "disabled" : ""
                            }`}
                          >
                            <Link
                              onClick={() =>
                                handlePageChangeUser(currentPageUser + 1)
                              }
                              to="#"
                              className="page-link"
                            >
                              Siguiente
                            </Link>
                          </li>
    </ul>
  </nav>
</div>
</section>
</div>
</div>
      
  );
};

export default UsuariosAdmin;
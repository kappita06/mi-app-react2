import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FiUserPlus, FiPlus, FiFileText, FiDollarSign, 
  FiShoppingCart, FiTrash2, FiX, FiCheck, 
  FiSearch, FiUsers, FiPackage, FiCreditCard,
  FiHome  // Nuevo icono agregado
} from 'react-icons/fi';

function App() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [venta, setVenta] = useState({
    cliente_id: '',
    producto_id: '',
    nombre_producto: '',
    tipo_documento: '',
    num_serie: '',
    cantidad: 1,
    precio: 0,
    total: 0,
  });

  const [ventas, setVentas] = useState([]);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [previewImagen, setPreviewImagen] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [activeTab, setActiveTab] = useState('home');  // Cambiado a 'home' por defecto

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarClientes(),
        cargarProductos(),
        cargarCategorias(),
        cargarVentas()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales', error);
      Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    const res = await axios.get('http://localhost:4000/api/clientes');
    setClientes(res.data);
  };

  const cargarProductos = async () => {
    const res = await axios.get('http://localhost:4000/api/productos');
    setProductos(res.data);
  };

  const cargarCategorias = async () => {
    const res = await axios.get('http://localhost:4000/api/categorias');
    setCategorias(res.data);
  };

  const cargarVentas = async () => {
    const res = await axios.get('http://localhost:4000/api/ventas');
    setVentas(res.data);
  };

  const manejarCambioVenta = (e) => {
    const { name, value } = e.target;
    let nuevaVenta = { ...venta, [name]: value };

    if (name === "producto_id") {
      const productoSeleccionado = productos.find(p => p._id === value);
      if (productoSeleccionado) {
        nuevaVenta = {
          ...nuevaVenta,
          precio: productoSeleccionado.precio,
          cantidad: 1,
          total: productoSeleccionado.precio,
          nombre_producto: productoSeleccionado.nombre
        };
      }
    }

    if (name === "cantidad") {
      nuevaVenta.total = nuevaVenta.precio * value;
    }

    setVenta(nuevaVenta);
  };

  const generarPDF = (ventaData, clienteData, productoData) => {
    const pdfContent = document.createElement('div');
    pdfContent.style.position = 'absolute';
    pdfContent.style.left = '-9999px';
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = "'Inter', sans-serif";
    pdfContent.style.width = '500px';
    
    const fecha = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    pdfContent.innerHTML = `
      <div style="border: 1px solid #e2e8f0; padding: 25px; max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">
          <h2 style="margin: 0; color: #1e293b; font-weight: 700; letter-spacing: -0.5px;">TIENDA TECH</h2>
          <p style="margin: 5px 0; color: #64748b; font-size: 0.9rem;">Av. Principal 123 - Lima</p>
          <p style="margin: 5px 0; color: #64748b; font-size: 0.9rem;">RUC: 20123456789</p>
        </div>
        
        <h3 style="text-align: center; color: #1e293b; border-bottom: 1px solid #eee; padding-bottom: 10px; font-weight: 600; font-size: 1.1rem; letter-spacing: -0.25px;">
          ${ventaData.tipo_documento.toUpperCase()} ELECTRÓNICA
        </h3>
        <p style="text-align: center; font-weight: bold; color: #3b82f6; font-size: 1.2rem; margin-top: -5px;">N° ${ventaData.num_serie}</p>
        
        <div style="display: flex; justify-content: space-between; margin: 15px 0; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div>
            <p style="margin: 5px 0; color: #334155; font-size: 0.9rem;"><strong>Fecha:</strong> ${fecha}</p>
            <p style="margin: 5px 0; color: #334155; font-size: 0.9rem;"><strong>Cliente:</strong> ${clienteData?.nombre || 'No especificado'}</p>
          </div>
          <div>
            <p style="margin: 5px 0; color: #334155; font-size: 0.9rem;"><strong>Documento:</strong> ${clienteData?.tipo_documento || ''} ${clienteData?.documento || ''}</p>
            <p style="margin: 5px 0; color: #334155; font-size: 0.9rem;"><strong>Teléfono:</strong> ${clienteData?.telefono || ''}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem;">
          <thead>
            <tr style="background-color: #3b82f6; color: white;">
              <th style="padding: 12px; border: 1px solid #2563eb; text-align: left; font-weight: 500;">Descripción</th>
              <th style="padding: 12px; border: 1px solid #2563eb; text-align: center; font-weight: 500;">Cant.</th>
              <th style="padding: 12px; border: 1px solid #2563eb; text-align: right; font-weight: 500;">P. Unit.</th>
              <th style="padding: 12px; border: 1px solid #2563eb; text-align: right; font-weight: 500;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #e2e8f0; color: #334155;">${productoData?.nombre || ''}</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; color: #334155;">${ventaData.cantidad}</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; color: #334155;">S/ ${ventaData.precio.toFixed(2)}</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; color: #334155;">S/ ${ventaData.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="font-size: 0.95rem; color: #334155; margin-bottom: 8px;"><strong>SUBTOTAL: S/ ${ventaData.total.toFixed(2)}</strong></p>
          <p style="font-size: 0.95rem; color: #334155; margin-bottom: 8px;"><strong>IGV (18%): S/ ${(ventaData.total * 0.18).toFixed(2)}</strong></p>
          <p style="font-size: 1.1rem; color: #1e293b; font-weight: 600; margin-top: 10px;"><strong>TOTAL: S/ ${ventaData.total.toFixed(2)}</strong></p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 15px; color: #64748b; font-size: 0.75rem;">
          <p>Gracias por su compra</p>
          <p>Representación impresa de la ${ventaData.tipo_documento.toLowerCase()} electrónica</p>
          <p style="margin-top: 10px; font-size: 0.7rem;">Código de autorización: ${Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(pdfContent);

    html2canvas(pdfContent, {
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5');
      
      const imgWidth = 140;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${ventaData.tipo_documento}_${ventaData.num_serie}.pdf`);
      
      document.body.removeChild(pdfContent);
    });
  };

  const guardarVenta = async () => {
    if (!venta.cliente_id) {
      Swal.fire({
        title: 'Cliente requerido',
        text: 'Seleccione un cliente para continuar',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!venta.producto_id) {
      Swal.fire({
        title: 'Producto requerido',
        text: 'Seleccione un producto para continuar',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!venta.tipo_documento) {
      Swal.fire({
        title: 'Documento requerido',
        text: 'Seleccione el tipo de documento',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!venta.num_serie) {
      Swal.fire({
        title: 'Número de serie requerido',
        text: 'Ingrese el número de serie del documento',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const productoSeleccionado = productos.find(p => p._id === venta.producto_id);
    if (!productoSeleccionado) {
      Swal.fire({
        title: 'Producto no encontrado',
        text: 'El producto seleccionado no existe en el inventario',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (venta.cantidad > productoSeleccionado.stock) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${productoSeleccionado.stock} unidades disponibles.`,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/ventas', venta);
      const nuevaVenta = response.data;
      
      const cliente = clientes.find(c => c._id === venta.cliente_id);
      const producto = productos.find(p => p._id === venta.producto_id);
      
      generarPDF(nuevaVenta, cliente, producto);
      
      Swal.fire({
        title: '¡Venta registrada!',
        text: 'Se ha generado el comprobante de pago',
        icon: 'success',
        confirmButtonColor: '#10b981',
        showConfirmButton: false,
        timer: 1500
      });
      
      setVenta({
        cliente_id: '',
        producto_id: '',
        tipo_documento: '',
        num_serie: '',
        cantidad: 1,
        precio: 0,
        total: 0,
        nombre_producto: '',
      });
      
      cargarProductos();
      cargarVentas();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar la venta',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const anularVenta = async () => {
    if (!venta.venta_id) {
      Swal.fire({
        title: 'Venta no seleccionada',
        text: 'Seleccione una venta del historial para anular',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Anular esta venta?',
      text: "Esta acción no se puede deshacer y afectará el inventario",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:4000/api/ventas/${venta.venta_id}`);
      const producto = productos.find(p => p._id === venta.producto_id);
      
      if (producto) {
        const nuevoStock = producto.stock + parseInt(venta.cantidad);
        await axios.patch(`http://localhost:4000/api/productos/${venta.producto_id}`, { stock: nuevoStock });
      }

      Swal.fire({
        title: 'Venta anulada',
        text: 'El stock ha sido restaurado correctamente',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 1500
      });
      
      setVenta({
        cliente_id: '',
        producto_id: '',
        nombre_producto: '',
        tipo_documento: '',
        num_serie: '',
        cantidad: 1,
        precio: 0,
        total: 0,
        venta_id: ''
      });

      cargarProductos();
      cargarVentas();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo anular la venta',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!e.target.nombre.value.trim()) {
      Swal.fire({
        title: 'Nombre requerido',
        text: 'El nombre del cliente es obligatorio',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!documento) {
      Swal.fire({
        title: 'Documento requerido',
        text: 'El número de documento es obligatorio',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!tipoDocumento) {
      Swal.fire({
        title: 'Tipo de documento',
        text: 'Seleccione el tipo de documento',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!e.target.telefono.value.trim()) {
      Swal.fire({
        title: 'Teléfono requerido',
        text: 'El teléfono es obligatorio',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const clienteData = {
      nombre: e.target.nombre.value,
      tipo_documento: tipoDocumento,
      documento: documento,
      telefono: e.target.telefono.value
    };

    try {
      await axios.post('http://localhost:4000/api/clientes', clienteData);
      Swal.fire({
        title: '¡Cliente registrado!',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 1500
      });
      setModalCliente(false);
      cargarClientes();
    } catch (error) {
      console.error('Error al guardar el cliente', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el cliente',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const form = e.target;
    const nombre = form.nombre.value.trim();
    const precio = form.precio.value.trim();
    const categoria_id = form.categoria_id.value.trim();
    const stock = form.stock.value.trim();
    const modelo = form.modelo.value.trim();
    const color = form.color.value.trim();
    const imagen = form.imagen.value.trim();

    if (!nombre || !precio || !categoria_id || !stock || !modelo || !color) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Todos los campos son obligatorios',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const caracteristicas = {
      modelo,
      color
    };

    const productoData = {
      nombre,
      precio: parseFloat(precio),
      categoria_id,
      stock: parseInt(stock, 10),
      caracteristicas,
      imagen
    };

    try {
      await axios.post('http://localhost:4000/api/productos', productoData);
      Swal.fire({
        title: '¡Producto registrado!',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 1500
      });
      setModalProducto(false);
      setPreviewImagen('');
      cargarProductos();
      form.reset();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el producto',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const filteredProducts = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
    producto.caracteristicas?.modelo?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const calcularEstadisticas = () => {
    const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalVentasHoy = ventas.filter(v => {
      const ventaDate = new Date(v.fecha);
      const hoy = new Date();
      return ventaDate.getDate() === hoy.getDate() && 
             ventaDate.getMonth() === hoy.getMonth() && 
             ventaDate.getFullYear() === hoy.getFullYear();
    }).reduce((sum, venta) => sum + venta.total, 0);
    
    const productosVendidos = ventas.reduce((sum, venta) => sum + parseInt(venta.cantidad), 0);
    
    const ventasPorDocumento = ventas.reduce((acc, venta) => {
      acc[venta.tipo_documento] = (acc[venta.tipo_documento] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVentas,
      totalVentasHoy,
      productosVendidos,
      ventasPorDocumento,
      cantidadVentas: ventas.length
    };
  };

  return (
    <div className="container-fluid px-0" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div className="d-flex">
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-white shadow-sm" style={{ width: '280px', height: '100vh', position: 'sticky', top: 0 }}>
          <div className="d-flex align-items-center mb-4 px-2">
            <FiShoppingCart className="me-2" size={24} color="#3b82f6" />
            <span className="fs-4 fw-bold" style={{ color: '#1e293b' }}>Tienda Tech</span>
          </div>
          <hr className="my-2" />
          <ul className="nav nav-pills flex-column mb-auto">
  <li className="nav-item">
    <button 
      className={`nav-link d-flex align-items-center ${activeTab === 'home' ? 'active' : ''}`}
      onClick={() => setActiveTab('home')}
      style={{ 
        backgroundColor: activeTab === 'home' ? '#e0f2fe' : 'transparent',
        color: activeTab === 'home' ? '#0ea5e9' : '#64748b',
        fontWeight: 500,
        borderLeft: activeTab === 'home' ? '3px solid #0ea5e9' : 'none'
      }}
    >
      <FiHome className="me-2" />
      Home
    </button>
  </li>
  <li className="nav-item">
    <button 
      className={`nav-link d-flex align-items-center ${activeTab === 'ventas' ? 'active' : ''}`}
      onClick={() => setActiveTab('ventas')}
      style={{ 
        backgroundColor: activeTab === 'ventas' ? '#e0f2fe' : 'transparent',
        color: activeTab === 'ventas' ? '#0ea5e9' : '#64748b',
        fontWeight: 500,
        borderLeft: activeTab === 'ventas' ? '3px solid #0ea5e9' : 'none'
      }}
    >
      <FiCreditCard className="me-2" />
      Ventas
    </button>
  </li>
            <li className="nav-item">
              <button 
                className={`nav-link d-flex align-items-center ${activeTab === 'productos' ? 'active' : ''}`}
                onClick={() => setActiveTab('productos')}
                style={{ 
                  backgroundColor: activeTab === 'productos' ? '#e0f2fe' : 'transparent',
                  color: activeTab === 'productos' ? '#0ea5e9' : '#64748b',
                  fontWeight: 500,
                  borderLeft: activeTab === 'productos' ? '3px solid #0ea5e9' : 'none'
                }}
              >
                <FiPackage className="me-2" />
                Productos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link d-flex align-items-center ${activeTab === 'clientes' ? 'active' : ''}`}
                onClick={() => setActiveTab('clientes')}
                style={{ 
                  backgroundColor: activeTab === 'clientes' ? '#e0f2fe' : 'transparent',
                  color: activeTab === 'clientes' ? '#0ea5e9' : '#64748b',
                  fontWeight: 500,
                  borderLeft: activeTab === 'clientes' ? '3px solid #0ea5e9' : 'none'
                }}
              >
                <FiUsers className="me-2" />
                Clientes
              </button>
            </li>
          </ul>
          <div className="mt-auto p-2">
            <div className="card border-0 shadow-sm" style={{ backgroundColor: '#f1f5f9' }}>
              <div className="card-body p-3">
                <h6 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Resumen del día</h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Ventas:</span>
                  <span className="fw-bold" style={{ color: '#10b981' }}>{ventas.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Total:</span>
                  <span className="fw-bold" style={{ color: '#3b82f6' }}>
                    S/ {ventas.reduce((sum, venta) => sum + venta.total, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4" style={{ maxWidth: 'calc(100% - 280px)' }}>
          {activeTab === 'home' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                  <FiHome className="me-2" color="#3b82f6" />
                  <span style={{ fontWeight: 600 }}>Estadísticas de Ventas</span>
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Tarjeta 1 - Ventas totales */}
                  <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#f0fdf4' }}>
                      <div className="card-body text-center">
                        <FiDollarSign size={24} className="mb-2" color="#16a34a" />
                        <h5 className="fw-bold mb-1" style={{ color: '#166534' }}>
                          S/ {calcularEstadisticas().totalVentas.toFixed(2)}
                        </h5>
                        <p className="text-muted small mb-0">Ventas totales</p>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2 - Ventas hoy */}
                  <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#eff6ff' }}>
                      <div className="card-body text-center">
                        <FiShoppingCart size={24} className="mb-2" color="#2563eb" />
                        <h5 className="fw-bold mb-1" style={{ color: '#1e40af' }}>
                          S/ {calcularEstadisticas().totalVentasHoy.toFixed(2)}
                        </h5>
                        <p className="text-muted small mb-0">Ventas hoy</p>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3 - Productos vendidos */}
                  <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#fef2f2' }}>
                      <div className="card-body text-center">
                        <FiPackage size={24} className="mb-2" color="#dc2626" />
                        <h5 className="fw-bold mb-1" style={{ color: '#991b1b' }}>
                          {calcularEstadisticas().productosVendidos}
                        </h5>
                        <p className="text-muted small mb-0">Productos vendidos</p>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 4 - Total ventas */}
                  <div className="col-md-3 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#fff7ed' }}>
                      <div className="card-body text-center">
                        <FiFileText size={24} className="mb-2" color="#ea580c" />
                        <h5 className="fw-bold mb-1" style={{ color: '#9a3412' }}>
                          {calcularEstadisticas().cantidadVentas}
                        </h5>
                        <p className="text-muted small mb-0">Transacciones</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfico de tipos de documento */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-0">
                        <h6 className="mb-0" style={{ color: '#1e293b' }}>Tipo de Documentos</h6>
                      </div>
                      <div className="card-body">
                        <div style={{ height: '250px' }}>
                          <div className="d-flex flex-column h-100 justify-content-center">
                            {Object.entries(calcularEstadisticas().ventasPorDocumento).map(([tipo, cantidad]) => (
                              <div key={tipo} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="text-capitalize fw-medium" style={{ color: '#475569' }}>
                                    {tipo}s: 
                                  </span>
                                  <span className="fw-bold" style={{ color: '#1e40af' }}>
                                    {cantidad}
                                  </span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${tipo === 'boleta' ? 'bg-blue-500' : 'bg-green-500'}`} 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${(cantidad / calcularEstadisticas().cantidadVentas) * 100}%`
                                    }} 
                                    aria-valuenow={(cantidad / calcularEstadisticas().cantidadVentas) * 100} 
                                    aria-valuemin="0" 
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Últimas ventas */}
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-0">
                        <h6 className="mb-0" style={{ color: '#1e293b' }}>Últimas Ventas</h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="list-group list-group-flush" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                          {ventas.slice(0, 5).map(venta => {
                            const cliente = clientes.find(c => c._id === venta.cliente_id);
                            return (
                              <div key={venta._id} className="list-group-item border-0 py-3">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <div className="d-flex align-items-center">
                                      <span className={`badge me-2 ${venta.tipo_documento === 'factura' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}
                                        style={{ fontWeight: 500, borderRadius: '6px', fontSize: '0.7rem', padding: '4px 8px' }}>
                                        {venta.tipo_documento.toUpperCase()}
                                      </span>
                                      <small style={{ color: '#64748b' }}>
                                        {cliente?.nombre || 'Cliente no encontrado'}
                                      </small>
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                      {new Date(venta.fecha).toLocaleDateString()} - {new Date(venta.fecha).toLocaleTimeString()}
                                    </small>
                                  </div>
                                  <span className="fw-bold" style={{ color: '#1e40af' }}>S/ {venta.total.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {!loading && (
            <>
              {activeTab === 'ventas' && (
                <div className="row g-4">
                  {/* Sección izquierda - Formulario de venta */}
                  <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                          <FiFileText className="me-2" color="#3b82f6" />
                          <span style={{ fontWeight: 600 }}>Nueva Venta</span>
                        </h5>
                        <button 
                          className="btn btn-sm d-flex align-items-center"
                          onClick={() => setModalCliente(true)}
                          style={{ 
                            backgroundColor: '#e0f2fe',
                            color: '#0ea5e9',
                            fontWeight: 500
                          }}
                        >
                          <FiUserPlus className="me-1" size={14} />
                          Nuevo Cliente
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-medium" style={{ color: '#475569' }}>Cliente</label>
                          <select
                            className="form-select"
                            name="cliente_id"
                            value={venta.cliente_id}
                            onChange={manejarCambioVenta}
                            style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                          >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cliente => (
                              <option key={cliente._id} value={cliente._id}>{cliente.nombre}</option>
                            ))}
                          </select>
                        </div>
        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-medium" style={{ color: '#475569' }}>Documento</label>
                            <select
                              className="form-select"
                              name="tipo_documento"
                              value={venta.tipo_documento}
                              onChange={manejarCambioVenta}
                              style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                            >
                              <option value="">Tipo de documento</option>
                              <option value="boleta">Boleta</option>
                              <option value="factura">Factura</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-medium" style={{ color: '#475569' }}>Número de Serie</label>
                            <input
                              type="text"
                              className="form-control"
                              name="num_serie"
                              value={venta.num_serie}
                              onChange={manejarCambioVenta}
                              placeholder="Ingrese número"
                              style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                            />
                          </div>
                        </div>
        
                        <div className="mb-3 mt-3">
                          <label className="form-label fw-medium" style={{ color: '#475569' }}>Producto seleccionado</label>
                          <input
                            type="text"
                            className="form-control"
                            value={venta.nombre_producto || "Ningún producto seleccionado"}
                            disabled
                            style={{ 
                              borderRadius: '8px', 
                              borderColor: '#e2e8f0',
                              backgroundColor: '#f8fafc',
                              color: venta.nombre_producto ? '#1e293b' : '#94a3b8'
                            }}
                          />
                        </div>
        
                        <div className="row g-3 mb-3">
                          <div className="col-md-4">
                            <label className="form-label fw-medium" style={{ color: '#475569' }}>Cantidad</label>
                            <input
                              type="number"
                              className="form-control"
                              name="cantidad"
                              value={venta.cantidad}
                              onChange={manejarCambioVenta}
                              min="1"
                              style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-medium" style={{ color: '#475569' }}>Precio Unitario</label>
                            <div className="input-group">
                              <span className="input-group-text" style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }}>S/</span>
                              <input
                                type="text"
                                className="form-control"
                                value={venta.precio.toFixed(2)}
                                disabled
                                style={{ borderRadius: '8px', borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-medium" style={{ color: '#475569' }}>Total</label>
                            <div className="input-group">
                              <span className="input-group-text" style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }}>S/</span>
                              <input
                                type="text"
                                className="form-control fw-bold"
                                value={venta.total.toFixed(2)}
                                disabled
                                style={{ 
                                  borderRadius: '8px', 
                                  borderColor: '#e2e8f0',
                                  backgroundColor: '#f8fafc',
                                  color: '#1e40af'
                                }}
                              />
                            </div>
                          </div>
                        </div>
        
                        <div className="d-flex justify-content-between mt-4">
                          <button 
                            className="btn d-flex align-items-center justify-content-center"
                            style={{ 
                              width: '48%',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: 500,
                              height: '42px'
                            }}
                            onClick={guardarVenta}
                          >
                            <FiCheck className="me-2" />
                            Registrar Venta
                          </button>
                          <button 
                            className="btn d-flex align-items-center justify-content-center"
                            style={{ 
                              width: '48%',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '8px',
                              fontWeight: 500,
                              height: '42px'
                            }}
                            onClick={anularVenta}
                          >
                            <FiTrash2 className="me-2" />
                            Anular Venta
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección derecha - Productos y ventas */}
                  <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                        <h6 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                          <FiPackage className="me-2" color="#3b82f6" />
                          <span style={{ fontWeight: 600 }}>Productos</span>
                        </h6>
                        <button 
                          className="btn btn-sm d-flex align-items-center"
                          onClick={() => setModalProducto(true)}
                          style={{ 
                            backgroundColor: '#e0f2fe',
                            color: '#0ea5e9',
                            fontWeight: 500
                          }}
                        >
                          <FiPlus className="me-1" size={14} />
                          Nuevo
                        </button>
                      </div>
                      <div className="card-body p-0">
                        <div className="px-3 pt-2 pb-1">
                          <div className="input-group mb-2">
                            <span className="input-group-text" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                              <FiSearch size={16} color="#94a3b8" />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Buscar producto..."
                              style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                              value={searchProduct}
                              onChange={(e) => setSearchProduct(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {filteredProducts.map(producto => (
                            <button
                              key={producto._id}
                              className="list-group-item list-group-item-action border-0 py-3"
                              onClick={() => {
                                setVenta(prev => ({
                                  ...prev,
                                  producto_id: producto._id,
                                  nombre_producto: producto.nombre,
                                  precio: producto.precio,
                                  cantidad: 1,
                                  total: producto.precio
                                }));
                              }}
                              style={{ 
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: venta.producto_id === producto._id ? '#f0f9ff' : 'white'
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  marginRight: '12px',
                                  flexShrink: 0,
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#f8fafc'
                                }}>
                                  {producto.imagen ? (
                                    <img 
                                      src={producto.imagen} 
                                      alt={producto.nombre}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                          <div style="
                                            width: 100%;
                                            height: 100%;
                                            background: #f8fafc;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: #94a3b8;
                                            font-size: 10px;
                                          ">
                                            Sin imagen
                                          </div>
                                        `;
                                      }}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '100%',
                                      height: '100%',
                                      background: '#f8fafc',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#94a3b8',
                                      fontSize: '10px'
                                    }}>
                                      Sin imagen
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between">
                                    <strong style={{ color: '#1e293b' }}>{producto.nombre}</strong>
                                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>S/ {producto.precio.toFixed(2)}</span>
                                  </div>
                                  <div className="d-flex justify-content-between mt-1">
                                    <small style={{ color: '#64748b' }}>{producto.caracteristicas?.modelo || 'Sin modelo'}</small>
                                    <small className={producto.stock > 0 ? 'text-success' : 'text-danger'}>
                                      Stock: {producto.stock}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                          <FiFileText className="me-2" color="#3b82f6" />
                          <span style={{ fontWeight: 600 }}>Historial de Ventas</span>
                        </h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {ventas.map(v => {
                            const cliente = clientes.find(c => c._id === v.cliente_id);
                            const producto = productos.find(p => p._id === v.producto_id);
                            
                            return (
                              <button
                                key={v._id}
                                className="list-group-item list-group-item-action border-0 py-3"
                                onClick={() => {
                                  setVenta({
                                    ...v,
                                    nombre_producto: producto?.nombre || '',
                                    venta_id: v._id
                                  });
                                }}
                                style={{ 
                                  borderBottom: '1px solid #f1f5f9',
                                  backgroundColor: venta.venta_id === v._id ? '#f0f9ff' : 'white'
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <div className="d-flex align-items-center">
                                      <span 
                                        className={`badge me-2 ${v.tipo_documento === 'factura' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}
                                        style={{ 
                                          fontWeight: 500,
                                          borderRadius: '6px',
                                          fontSize: '0.7rem',
                                          padding: '4px 8px'
                                        }}
                                      >
                                        {v.tipo_documento.toUpperCase()}
                                      </span>
                                      <strong style={{ color: '#1e293b' }}>#{v.num_serie}</strong>
                                    </div>
                                    <small style={{ color: '#64748b' }}>
                                      {cliente?.nombre} - {new Date(v.fecha).toLocaleDateString()}
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <span className="fw-bold me-2" style={{ color: '#1e40af' }}>S/ {v.total.toFixed(2)}</span>
                                    <button 
                                      className="btn btn-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generarPDF(v, cliente, producto);
                                      }}
                                      style={{ 
                                        backgroundColor: '#e0f2fe',
                                        color: '#0ea5e9',
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        padding: '4px 8px',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      PDF
                                    </button>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'productos' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                      <FiPackage className="me-2" color="#3b82f6" />
                      <span style={{ fontWeight: 600 }}>Lista de Productos</span>
                    </h5>
                    <button 
                      className="btn btn-sm d-flex align-items-center"
                      onClick={() => setModalProducto(true)}
                      style={{ 
                        backgroundColor: '#e0f2fe',
                        color: '#0ea5e9',
                        fontWeight: 500
                      }}
                    >
                      <FiPlus className="me-1" size={14} />
                      Nuevo Producto
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                          <tr>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Producto</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Categoría</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Precio</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Stock</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Modelo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.map(producto => {
                            const categoria = categorias.find(c => c._id === producto.categoria_id);
                            return (
                              <tr key={producto._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div style={{ 
                                      width: '40px', 
                                      height: '40px', 
                                      marginRight: '12px',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      border: '1px solid #e2e8f0',
                                      backgroundColor: '#f8fafc'
                                    }}>
                                      {producto.imagen ? (
                                        <img 
                                          src={producto.imagen} 
                                          alt={producto.nombre}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                      ) : (
                                        <div className="d-flex align-items-center justify-content-center h-100" style={{ color: '#94a3b8' }}>
                                          <FiPackage size={16} />
                                        </div>
                                      )}
                                    </div>
                                    <span style={{ color: '#1e293b' }}>{producto.nombre}</span>
                                  </div>
                                </td>
                                <td style={{ color: '#475569' }}>{categoria?.nombre || 'Sin categoría'}</td>
                                <td style={{ color: '#1d4ed8', fontWeight: 600 }}>S/ {producto.precio.toFixed(2)}</td>
                                <td>
                                  <span className={`badge ${producto.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} style={{ borderRadius: '6px', fontWeight: 500 }}>
                                    {producto.stock} unidades
                                  </span>
                                </td>
                                <td style={{ color: '#475569' }}>{producto.caracteristicas?.modelo || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'clientes' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
                      <FiUsers className="me-2" color="#3b82f6" />
                      <span style={{ fontWeight: 600 }}>Lista de Clientes</span>
                    </h5>
                    <button 
                      className="btn btn-sm d-flex align-items-center"
                      onClick={() => setModalCliente(true)}
                      style={{ 
                        backgroundColor: '#e0f2fe',
                        color: '#0ea5e9',
                        fontWeight: 500
                      }}
                    >
                      <FiUserPlus className="me-1" size={14} />
                      Nuevo Cliente
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                          <tr>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Nombre</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Documento</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Teléfono</th>
                            <th style={{ color: '#475569', fontWeight: 600 }}>Ventas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientes.map(cliente => {
                            const ventasCliente = ventas.filter(v => v.cliente_id === cliente._id).length;
                            return (
                              <tr key={cliente._id}>
                                <td style={{ color: '#1e293b' }}>{cliente.nombre}</td>
                                <td>
                                  <span className="badge bg-blue-100 text-blue-800" style={{ borderRadius: '6px', fontWeight: 500 }}>
                                    {cliente.tipo_documento.toUpperCase()}: {cliente.documento}
                                  </span>
                                </td>
                                <td style={{ color: '#475569' }}>{cliente.telefono}</td>
                                <td>
                                  <span className="badge bg-green-100 text-green-800" style={{ borderRadius: '6px', fontWeight: 500 }}>
                                    {ventasCliente} compras
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal Nuevo Producto */}
      {modalProducto && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header" style={{ backgroundColor: '#3b82f6', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h5 className="modal-title d-flex align-items-center text-white">
                  <FiPlus className="me-2" />
                  Nuevo Producto
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setModalProducto(false);
                    setPreviewImagen('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={guardarProducto}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: '#475569' }}>Nombre del producto</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      placeholder="Ej: Laptop HP Pavilion"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium" style={{ color: '#475569' }}>Precio (S/)</label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>S/</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="precio"
                          placeholder="0.00"
                          required
                          style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium" style={{ color: '#475569' }}>Stock inicial</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stock"
                        placeholder="0"
                        min="0"
                        required
                        style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: '#475569' }}>Categoría</label>
                    <select 
                      className="form-select" 
                      name="categoria_id" 
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    >
                      <option value="">Seleccione una categoría</option>
                      {categorias.map(categoria => (
                        <option key={categoria._id} value={categoria._id}>{categoria.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: '#475569' }}>Características</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="modelo"
                      placeholder="Modelo"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      placeholder="Color"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: '#475569' }}>URL de la Imagen</label>
                    <input
                      type="url"
                      className="form-control"
                      name="imagen"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      onChange={(e) => setPreviewImagen(e.target.value)}
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </div>

                  {previewImagen && (
                    <div className="mt-2 mb-3">
                      <p className="small mb-1 fw-medium" style={{ color: '#475569' }}>Vista previa:</p>
                      <img 
                        src={previewImagen} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100px', 
                          maxHeight: '100px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                        className="img-thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="
                              width: 100px;
                              height: 100px;
                              background: #f8fafc;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border-radius: 8px;
                              border: 1px solid #e2e8f0;
                              color: #94a3b8;
                              font-size: 12px;
                            ">
                              Imagen no disponible
                            </div>
                          `;
                        }}
                      />
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                      type="button" 
                      className="btn btn-light d-flex align-items-center"
                      onClick={() => {
                        setModalProducto(false);
                        setPreviewImagen('');
                      }}
                      style={{ 
                        borderRadius: '8px',
                        borderColor: '#e2e8f0',
                        fontWeight: 500
                      }}
                    >
                      <FiX className="me-1" />
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn d-flex align-items-center"
                      style={{ 
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 500
                      }}
                    >
                      <FiCheck className="me-1" />
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal Nuevo Cliente */}
      {modalCliente && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title d-flex align-items-center">
                  <FiUserPlus className="me-2" />
                  Nuevo Cliente
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalCliente(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={guardarCliente}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre completo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Juan Pérez López"
                      name="nombre"
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tipo de documento</label>
                      <select
                        className="form-select"
                        name="tipo_documento"
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        value={tipoDocumento}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="dni">DNI</option>
                        <option value="ruc">RUC</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Número de documento</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={tipoDocumento === 'dni' ? '8 dígitos' : '11 dígitos'}
                        name="documento"
                        value={documento}
                        onChange={(e) => {
                          let value = e.target.value;
                          const maxLength = tipoDocumento === 'dni' ? 8 : tipoDocumento === 'ruc' ? 11 : null;
                          value = value.replace(/\D/g, '').slice(0, maxLength);
                          setDocumento(value);
                        }}
                        maxLength={tipoDocumento === 'dni' ? 8 : tipoDocumento === 'ruc' ? 11 : ''}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Teléfono</label>
                    <div className="input-group">
                      <span className="input-group-text">+51</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="987654321"
                        name="telefono"
                        maxLength={9}
                        pattern="[0-9]{9}"
                        inputMode="numeric"
                        required
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => setModalCliente(false)}
                    >
                      <FiX className="me-1" />
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary d-flex align-items-center"
                    >
                      <FiCheck className="me-1" />
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
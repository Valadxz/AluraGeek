document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/productos';
    let productos = []; // Esta variable almacenará todos los productos

    // Obtener productos
    async function obtenerProductos() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            productos = await response.json(); // Guardamos los productos en la variable global
            console.log('Productos cargados:', productos); // Para depuración
            mostrarProductos(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
        }
    }

    // Mostrar productos en la página
    function mostrarProductos(productos) {
        const itemsContenedor = document.querySelector('.items-contenedor');
        itemsContenedor.innerHTML = '';

        productos.forEach(producto => {
            itemsContenedor.innerHTML += `
                <div class="item" data-id="${producto.id}">
                    <img src="${producto.imagen}" alt="">
                    <h4>${producto.nombre}</h4>
                    <ul>
                        <li><span>$ </span> ${producto.precio.toFixed(2)}</li>
                        <li><i class="fa fa-trash" data-id="${producto.id}"></i></li>
                    </ul>
                </div>
            `;
        });
    }

    // Función para agregar un producto
    async function agregarProducto(e) {
        e.preventDefault();

        const formData = new FormData(e.target); // Obtener todos los datos del formulario

        // Para depuración, puedes verificar qué datos se están enviando
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error al agregar el producto: ${errorData}`);
            }

            const nuevoProducto = await response.json();
            console.log('Producto agregado:', nuevoProducto);
            // Refresca la lista de productos
            obtenerProductos(); 
            e.target.reset();
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    }

    // Función para eliminar un producto
    async function eliminarProducto(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }

            obtenerProductos(); 
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }

    // Función para buscar productos
    function buscarProductos() {
        const buscadorInput = document.querySelector('.buscador-input');
        const searchTerm = buscadorInput.value.toLowerCase(); 

        // Filtrar los productos que coinciden con el término de búsqueda
        const productosFiltrados = productos.filter(producto => {
            return producto.nombre.toLowerCase().includes(searchTerm); 
        });

        mostrarProductos(productosFiltrados); 
    }

    // Función para obtener información de un producto por su ID
    async function obtenerProductoPorId(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error('Error al obtener el producto');
            }
            const producto = await response.json();
            mostrarInformacionProducto(producto);
        } catch (error) {
            console.error('Error al obtener la información del producto:', error);
        }
    }

    // Función para mostrar la información del producto
    function mostrarInformacionProducto(producto) {
        const modal = document.getElementById('modal-producto');
        const modalTitulo = document.getElementById('modal-titulo');
        const modalImagen = document.getElementById('modal-imagen');
        const modalPrecio = document.getElementById('modal-precio');
        const modalDescripcion = document.getElementById('modal-descripcion');
        
        // Verifica que el modal y sus elementos existan
        if (modal && modalTitulo && modalImagen && modalPrecio && modalDescripcion) {
            // Rellenar la información del modal con los datos del producto
            modalTitulo.textContent = producto.nombre;
            modalImagen.src = producto.imagen;
            modalPrecio.innerHTML = `<span>Precio: </span>$`;
            modalPrecio.innerHTML += producto.precio.toFixed(2);
            modalDescripcion.textContent = producto.descripcion || 'Sin descripción';
            
            // Mostrar el modal
            modal.style.display = 'block';

            // Cerrar el modal cuando se haga clic en la "x"
            const closeModal = document.querySelector('.close');
            if (closeModal) {
                closeModal.onclick = function() {
                    modal.style.display = 'none';
                }
            }

            // Cerrar el modal si se hace clic fuera del contenido
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            }
        } else {
            console.error('Elementos del modal no encontrados');
        }
    }

    // Event listener para el formulario de agregar producto
    const formulario = document.getElementById('formulario-producto');
    if (formulario) {
        formulario.addEventListener('submit', agregarProducto);
    }

    // Event listener para eliminar productos y mostrar detalles usando event delegation
    const itemsContenedor = document.querySelector('.items-contenedor');
    itemsContenedor.addEventListener('click', (e) => {
        // Manejar la eliminación del producto
        if (e.target.classList.contains('fa-trash')) {
            const id = e.target.dataset.id; // Obtiene el ID del producto a eliminar
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                eliminarProducto(id);
            }
            // Evitar que se procese el clic para mostrar el producto
            return; // Detiene la ejecución aquí si se elimina un producto
        }

        // Manejar la visualización del producto solo si no es un ícono de eliminación
        const item = e.target.closest('.item'); 
        if (item) {
            const id = item.dataset.id; 
            obtenerProductoPorId(id); 
        }
    });

    // Event listener para el campo de búsqueda
    const buscadorInput = document.querySelector('.buscador-input');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', buscarProductos); 
    }

    // Obtener productos al cargar la página
    obtenerProductos();

    // Cerrar el modal del producto
    const closeProductModal = document.getElementById('close-producto');
    if (closeProductModal) {
        closeProductModal.addEventListener('click', function () {
            document.getElementById('modal-producto').style.display = 'none';
        });
    }
});

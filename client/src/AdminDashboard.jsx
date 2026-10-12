import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import "./AdminDashboard.css";
const API_URL = "https://enterprise-ecommerce-oct.onrender.com/api";
function AdminDashboard({ token }) {
  // ==========================================
  // STATE
  // ==========================================
 const [activeSection, setActiveSection] = useState("dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
const [allOrders, setAllOrders] = useState([]);
const [allCustomers, setAllCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [products, setProducts] = useState([]);
const [productSearch, setProductSearch] = useState("");
const [productPage, setProductPage] = useState(1);
const [productTotalPages, setProductTotalPages] = useState(1);
const [productCategory, setProductCategory] = useState("");
const [productStock, setProductStock] = useState("");
const [productSort, setProductSort] = useState("newest");
  const [editingProductId, setEditingProductId] = useState(null);
const [categories, setCategories] = useState([]);
const [showCategoryForm, setShowCategoryForm] =
  useState(false);
const [editingCategoryId, setEditingCategoryId] =
  useState(null);
const [categoryForm, setCategoryForm] = useState({
  name: "",
  description: ""
});
  const [showProductForm, setShowProductForm] =
    useState(false);
  const [productForm, setProductForm] = useState({
  category_id: "",
  name: "",
  description: "",
  price: "",
  discount: "0",
  stock: "",
  image_url: ""
});
const [uploadingImage, setUploadingImage] = useState(false);
const [selectedImageName, setSelectedImageName] = useState("");
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const handleSectionChange = (section) => {
    setActiveSection(section);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };
        // ==========================================
        // MAIN ANALYTICS
        // ==========================================
        const analyticsResponse = await fetch(
          `${API_URL}/analytics`,
          { headers }
        );
        const analyticsResult =
          await analyticsResponse.json();
        if (!analyticsResponse.ok) {
          throw new Error(
            analyticsResult.message ||
            "Failed to load analytics"
          );
        }
        // ==========================================
        // SALES ANALYTICS
        // ==========================================
        const salesResponse = await fetch(
          `${API_URL}/analytics/sales`,
          { headers }
        );
        const salesResult =
          await salesResponse.json();
        if (!salesResponse.ok) {
          throw new Error(
            salesResult.message ||
            "Failed to load sales analytics"
          );
        }
        // ==========================================
        // PRODUCT & CATEGORY ANALYTICS
        // ==========================================
        const productResponse = await fetch(
          `${API_URL}/analytics/products`,
          { headers }
        );
        const productResult =
          await productResponse.json();
        if (!productResponse.ok) {
          throw new Error(
            productResult.message ||
            "Failed to load product analytics"
          );
        }
        // ==========================================
        // CUSTOMER ANALYTICS
        // ==========================================
        const customerResponse = await fetch(
          `${API_URL}/analytics/customers`,
          { headers }
        );
        const customerResult =
          await customerResponse.json();
        if (!customerResponse.ok) {
          throw new Error(
            customerResult.message ||
            "Failed to load customer analytics"
          );
        }
        // ==========================================
        // INVENTORY ANALYTICS
        // ==========================================
        const inventoryResponse = await fetch(
          `${API_URL}/analytics/inventory`,
          { headers }
        );
        const inventoryResult =
          await inventoryResponse.json();
        if (!inventoryResponse.ok) {
          throw new Error(
            inventoryResult.message ||
            "Failed to load inventory analytics"
          );
        }
        // ==========================================
// CATEGORIES
// ==========================================
const categoriesResponse = await fetch(
  `${API_URL}/categories`, { headers }
);
const categoriesResult =
  await categoriesResponse.json();
if (!categoriesResponse.ok) {
  throw new Error(
    categoriesResult.message ||
    "Failed to load categories"
  );
}
setCategories(
  categoriesResult.categories
);
// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================
const ordersResponse = await fetch(
  `${API_URL}/orders/admin/all`,
  {
    headers
  }
);
const ordersResult =
  await ordersResponse.json();
if (!ordersResponse.ok) {
  throw new Error(
    ordersResult.message ||
    "Failed to load orders"
  );
}
setAllOrders(
  ordersResult.orders || []
);
// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================
const allCustomersResponse = await fetch(
  `${API_URL}/users/admin/customers`,
  { headers }
);
const allCustomersResult =
  await allCustomersResponse.json();
if (!allCustomersResponse.ok) {
  throw new Error(
    allCustomersResult.message ||
    "Failed to load customers"
  );
}
setAllCustomers(
  allCustomersResult.customers || []
);
        // ==========================================
        // PRODUCT MANAGEMENT
        // ==========================================
        const productsResponse = await fetch(
          `${API_URL}/products`
        );
        const productsResult =
          await productsResponse.json();
        if (!productsResponse.ok) {
          throw new Error(
            productsResult.message ||
            "Failed to load products"
          );
        }
        // ==========================================
        // SET ANALYTICS
        // ==========================================
        setAnalytics(
          analyticsResult.analytics
        );
        // ==========================================
        // SET SALES DATA
        // ==========================================
        setSalesData(
          salesResult.sales.map((item) => ({
            date: new Date(
              item.date
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short"
              }
            ),
            orders: Number(item.orders),
            revenue: Number(item.revenue)
          }))
        );
        // ==========================================
        // SET PRODUCT ANALYTICS
        // ==========================================
        setProductData(
          productResult.products.map((item) => ({
            name: item.name,
            units_sold:
              Number(item.units_sold),
            revenue:
              Number(item.revenue)
          }))
        );
        // ==========================================
        // SET CATEGORY ANALYTICS
        // ==========================================
        setCategoryData(
          productResult.categories.map((item) => ({
            category: item.category,
            units_sold:
              Number(item.units_sold),
            revenue:
              Number(item.revenue)
          }))
        );
        // ==========================================
        // SET CUSTOMER DATA
        // ==========================================
        setCustomers(
          customerResult.customers
        );
        setRecentOrders(
          customerResult.orders
        );
        // ==========================================
        // SET INVENTORY DATA
        // ==========================================
        setInventory(
          inventoryResult.inventory
        );
        setLowStock(
          inventoryResult.low_stock
        );
        setOutOfStock(
          inventoryResult.out_of_stock
        );
        // ==========================================
        // SET PRODUCT MANAGEMENT DATA
        // ==========================================
        setProducts(
          productsResult.products
        );
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);
  // ==========================================
// ==========================================
// REFRESH PRODUCTS
// ==========================================
const loadProducts = async (
  page = 1,
  search = productSearch,
  category = productCategory,
  stock = productStock,
  sort = productSort
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      search,
      category,
      stock,
      sort
    });
    const response = await fetch(
      `${API_URL}/products?${params.toString()}`
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load products"
      );
    }
    setProducts(result.products || []);
    if (result.pagination) {
      setProductPage(
        result.pagination.currentPage
      );
      setProductTotalPages(
        result.pagination.totalPages || 1
      );
    }
  } catch (error) {
    console.error(
      "Load products error:",
      error
    );
  }
};
// ==========================================
// RESET PRODUCT FORM
// ==========================================
const resetProductForm = () => {
  setProductForm({
    category_id: "",
    name: "",
    description: "",
    price: "",
    discount: "0",
    stock: "",
    image_url: ""
  });
  setEditingProductId(null);
  setSelectedImageName("");
  setUploadingImage(false);
};
// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];
  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
    event.target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be 5 MB or less.");
    event.target.value = "";
    return;
  }
  try {
    setUploadingImage(true);
    setSelectedImageName(file.name);
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(
      `${API_URL}/uploads/product-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.message || "Failed to upload image"
      );
    }
    setProductForm((currentForm) => ({
      ...currentForm,
      image_url: result.image_url || ""
    }));
    alert("Image uploaded successfully!");
  } catch (error) {
    console.error("Image upload error:", error);
    setSelectedImageName("");
    alert(error.message || "Failed to upload image");
  } finally {
    setUploadingImage(false);
  }
};
// ==========================================
// CREATE PRODUCT
// ==========================================
const handleCreateProduct = async () => {
  try {
    if (!productForm.name.trim() || productForm.price === "" || productForm.stock === "") {
      alert("Product name, price and stock are required.");
      return;
    }
    if (Number(productForm.price) < 0) {
      alert("Price cannot be negative.");
      return;
    }
    if (Number(productForm.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }
    if (Number(productForm.discount || 0) < 0 || Number(productForm.discount || 0) > 100) {
      alert("Discount must be between 0 and 100.");
      return;
    }
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: Number(productForm.price),
        discount: Number(productForm.discount || 0),
        stock: Number(productForm.stock),
        image_url: productForm.image_url.trim() || null
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to create product");
    }
    alert("Product created successfully!");
    await loadProducts();
    resetProductForm();
    setShowProductForm(false);
  } catch (error) {
    console.error("Create product error:", error);
    alert(error.message || "Failed to create product");
  }
};
// ==========================================
// UPDATE PRODUCT
// ==========================================
const handleUpdateProduct = async () => {
  try {
    if (!editingProductId) {
      alert("No product selected for editing.");
      return;
    }
    if (!productForm.name.trim() || productForm.price === "" || productForm.stock === "") {
      alert("Product name, price and stock are required.");
      return;
    }
    if (Number(productForm.price) < 0) {
      alert("Price cannot be negative.");
      return;
    }
    if (Number(productForm.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }
    if (Number(productForm.discount || 0) < 0 || Number(productForm.discount || 0) > 100) {
      alert("Discount must be between 0 and 100.");
      return;
    }
    const response = await fetch(`${API_URL}/products/${editingProductId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: Number(productForm.price),
        discount: Number(productForm.discount || 0),
        stock: Number(productForm.stock),
        image_url: productForm.image_url.trim() || null,
        is_active: true
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update product");
    }
    alert("Product updated successfully!");
    await loadProducts();
    resetProductForm();
    setShowProductForm(false);
  } catch (error) {
    console.error("Update product error:", error);
    alert(error.message || "Failed to update product");
  }
};
// ==========================================
// DELETE / DEACTIVATE PRODUCT
// ==========================================
const handleDeleteProduct = async (productId) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );
    if (!confirmed) return;
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to deactivate product");
    }
    alert("Product deactivated successfully!");
    await loadProducts();
  } catch (error) {
    console.error("Delete product error:", error);
    alert(error.message || "Failed to deactivate product");
  }
};
// ==========================================
// CREATE CATEGORY
// ==========================================
const handleCreateCategory = async () => {
  try {
    if (!categoryForm.name.trim()) {
      alert("Category name is required.");
      return;
    }
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to create category");
    }
    alert("Category created successfully!");
    await loadCategories();
    setCategoryForm({ name: "", description: "" });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  } catch (error) {
    console.error("Create category error:", error);
    alert(error.message || "Failed to create category");
  }
};
// ==========================================
// UPDATE CATEGORY
// ==========================================
const handleUpdateCategory = async () => {
  try {
    if (!editingCategoryId) {
      alert("No category selected for editing.");
      return;
    }
    if (!categoryForm.name.trim()) {
      alert("Category name is required.");
      return;
    }
    const response = await fetch(`${API_URL}/categories/${editingCategoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update category");
    }
    alert("Category updated successfully!");
    await loadCategories();
    setCategoryForm({ name: "", description: "" });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  } catch (error) {
    console.error("Update category error:", error);
    alert(error.message || "Failed to update category");
  }
};
// ==========================================
// DELETE CATEGORY
// ==========================================
const handleDeleteCategory = async (categoryId) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmed) return;
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to delete category");
    }
    alert("Category deleted successfully!");
    await loadCategories();
  } catch (error) {
    console.error("Delete category error:", error);
    alert(error.message || "Failed to delete category");
  }
};
// LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="dashboard-message">
        Loading analytics...
      </div>
    );
  }
  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div className="dashboard-error">
        {error}
      </div>
    );
  }
  return (
  <div className="admin-layout">
    {/* SIDEBAR */}
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🛍️</div>
        <div>
          <strong>Enterprise</strong>
          <span>Admin Panel</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button
          className={
            activeSection === "dashboard"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("dashboard")}
        >
          <span>📊</span>
          Dashboard
        </button>
        <button
          className={
            activeSection === "products"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("products")}
        >
          <span>📦</span>
          Products
        </button>
        <button
          className={
            activeSection === "categories"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("categories")}
        >
          <span>🗂️</span>
          Categories
        </button>
        <button
          className={
            activeSection === "customers"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("customers")}
        >
          <span>👥</span>
          Customers
        </button>
        <button
          className={
            activeSection === "orders"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("orders")}
        >
          <span>🛒</span>
          Orders
        </button>
        <button
          className={
            activeSection === "inventory"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("inventory")}
        >
          <span>📋</span>
          Inventory
        </button>
        <button
          className={
            activeSection === "analytics"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() => handleSectionChange("analytics")}
        >
          <span>📈</span>
          Analytics
        </button>
        
<button
  type="button"
  className="admin-logout"
  onClick={() => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("userRole");
    window.location.reload();
  }}
>
  🚪 Logout
</button>

      </nav>
    </aside>
    {/* MAIN CONTENT */}
    <main className="admin-main">
      <div className={`admin-dashboard section-${activeSection}`}>
      {/* ======================================
          HEADER
      ====================================== */}
      <div className="dashboard-header" data-section="dashboard">
        <div>
          <p className="dashboard-label">
            ADMIN PANEL
          </p>
          <h1>
            Analytics Dashboard
          </h1>
          <p>
            Monitor your e-commerce platform
            performance.
          </p>
        </div>
      </div>
      {/* ======================================
          STAT CARDS
      ====================================== */}
      <div className="stats-grid" data-section="dashboard">
        <div className="stat-card">
          <span className="stat-icon">
            👥
          </span>
          <p>
            Total Users
          </p>
          <h2>
            {analytics.total_users}
          </h2>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            📦
          </span>
          <p>
            Total Products
          </p>
          <h2>
            {analytics.total_products}
          </h2>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            🛒
          </span>
          <p>
            Total Orders
          </p>
          <h2>
            {analytics.total_orders}
          </h2>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            💰
          </span>
          <p>
            Total Revenue
          </p>
          <h2>
            ₹
            {Number(
              analytics.total_revenue
            ).toFixed(2)}
          </h2>
        </div>
      </div>
      {/* ======================================
          SALES ANALYTICS
      ====================================== */}
      <div className="chart-section" data-section="analytics">
        <div className="chart-header">
          <p className="dashboard-label">
            PERFORMANCE
          </p>
          <h2>
            Sales Analytics
          </h2>
          <p>
            Revenue and order performance
            over the last 7 days.
          </p>
        </div>
        <div className="chart-container">
          {salesData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart
                data={salesData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 10,
                  bottom: 10
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">
              No sales data available yet.
            </div>
          )}
        </div>
      </div>
      {/* ======================================
          PRODUCT & CATEGORY ANALYTICS
      ====================================== */}
      <div className="analytics-grid" data-section="analytics">
        {/* TOP PRODUCTS */}
        <div className="chart-section">
          <div className="chart-header">
            <p className="dashboard-label">
              PRODUCTS
            </p>
            <h2>
              Top Selling Products
            </h2>
            <p>
              Best performing products
              by units sold.
            </p>
          </div>
          <div className="chart-container">
            {productData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={productData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="units_sold"
                    name="Units Sold"
                    fill="#1d4ed8"
                    radius={[
                      0,
                      6,
                      6,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                No product sales data available.
              </div>
            )}
          </div>
        </div>
        {/* CATEGORY SALES */}
        <div className="chart-section">
          <div className="chart-header">
            <p className="dashboard-label">
              CATEGORIES
            </p>
            <h2>
              Category Performance
            </h2>
            <p>
              Revenue generated by each category.
            </p>
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="category"
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#16a34a"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-chart-data">
                No category sales data available.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ======================================
          TOP CUSTOMERS
      ====================================== */}
      <div className="table-section" data-section="analytics">
        <div className="table-header">
          <div>
            <p className="dashboard-label">
              CUSTOMERS
            </p>
            <h2>
              Top Customers
            </h2>
            <p>
              Customers ranked by total spending.
            </p>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>
                  Customer
                </th>
                <th>
                  Email
                </th>
                <th>
                  Orders
                </th>
                <th>
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map(
                (customer) => (
                  <tr
                    key={customer.id}
                  >
                    <td>
                      <strong>
                        {customer.name}
                      </strong>
                    </td>
                    <td>
                      {customer.email}
                    </td>
                    <td>
                      {customer.total_orders}
                    </td>
                    <td>
                      ₹
                      {Number(
                        customer.total_spent
                      ).toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
{/* ==========================================
    CUSTOMER MANAGEMENT
========================================== */}
<div className="table-section" data-section="customers">
  <div className="table-header">
    <div>
      <p className="dashboard-label">
        CUSTOMERS
      </p>
      <h2>
        Customer Management
      </h2>
      <p>
        View registered customers and account details.
      </p>
    </div>
  </div>
  <div className="table-wrapper">
    <table className="analytics-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined Date</th>
        </tr>
      </thead>
      <tbody>
        {allCustomers.length > 0 ? (
          allCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>
                #{customer.id}
              </td>
              <td>
                <strong>
                  {customer.name}
                </strong>
              </td>
              <td>
                {customer.email}
              </td>
              <td>
                <strong>
                  {customer.role}
                </strong>
              </td>
              <td>
                {new Date(
                  customer.created_at
                ).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="5"
              style={{
                textAlign: "center",
                padding: "30px"
              }}
            >
              No customers found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
{/* ==========================================
    ORDER MANAGEMENT
========================================== */}
<div className="table-section" data-section="orders">
  <div className="table-header">
    <div>
      <p className="dashboard-label">
        ORDERS
      </p>
      <h2>
        Order Management
      </h2>
      <p>
        View all customer orders and update
        their order status.
      </p>
    </div>
  </div>
  <div className="table-wrapper">
    <table className="analytics-table">
      <thead>
        <tr>
          <th>
            Order ID
          </th>
          <th>
            Customer
          </th>
          <th>
            Amount
          </th>
          <th>
            Payment
          </th>
          <th>
            Order Status
          </th>
          <th>
            Date
          </th>
          <th>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {allOrders.length > 0 ? (
          allOrders.map((order) => (
            <tr
              key={order.id}
            >
              <td>
                <strong>
                  #{order.id}
                </strong>
              </td>
              <td>
                <strong>
                  {order.customer_name}
                </strong>
                <br />
                <small>
                  {order.customer_email}
                </small>
              </td>
              <td>
                ₹
                {Number(
                  order.total_amount
                ).toFixed(2)}
              </td>
              <td>
                <span
                  className={`status-badge payment-${order.payment_status.toLowerCase()}`}
                >
                  {order.payment_status}
                </span>
              </td>
              <td>
                <span
                  className={`status-badge order-${order.order_status.toLowerCase()}`}
                >
                  {order.order_status}
                </span>
              </td>
              <td>
                {new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-IN"
                )}
              </td>
              <td>
                <select
                  value={
                    order.order_status
                  }
                  onChange={async (e) => {
                    const newStatus =
                      e.target.value;
                    try {
                      const response =
                        await fetch(
                          `${API_URL}/orders/admin/${order.id}/status`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type":
                                "application/json",
                              Authorization:
                                `Bearer ${token}`
                            },
                            body:
                              JSON.stringify({
                                order_status:
                                  newStatus
                              })
                          }
                        );
                      const result =
                        await response.json();
                      if (!response.ok) {
                        throw new Error(
                          result.message ||
                          "Failed to update order"
                        );
                      }
                      setAllOrders(
                        (currentOrders) =>
                          currentOrders.map(
                            (item) =>
                              item.id ===
                              order.id
                                ? {
                                    ...item,
                                    order_status:
                                      newStatus
                                  }
                                : item
                          )
                      );
                      alert(
                        "Order status updated successfully!"
                      );
                    } catch (error) {
                      console.error(
                        "Update order error:",
                        error
                      );
                      alert(
                        error.message
                      );
                    }
                  }}
                >
                  <option value="PENDING">
                    Pending
                  </option>
                  <option value="PROCESSING">
                    Processing
                  </option>
                  <option value="SHIPPED">
                    Shipped
                  </option>
                  <option value="DELIVERED">
                    Delivered
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="7"
              style={{
                textAlign: "center",
                padding: "30px"
              }}
            >
              No orders found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      {/* ======================================
          INVENTORY MANAGEMENT
      ====================================== */}
      <div className="table-section" data-section="inventory">
        <div className="table-header">
          <div>
            <p className="dashboard-label">
              INVENTORY
            </p>
            <h2>
              Inventory Management
            </h2>
            <p>
              Monitor product stock levels
              and identify products that
              need attention.
            </p>
          </div>
        </div>
        {/* INVENTORY ALERTS */}
        <div className="inventory-alerts">
          <div
            className="inventory-alert low-stock-alert"
          >
            <span>
              ⚠️
            </span>
            <div>
              <p>
                Low Stock
              </p>
              <strong>
                {lowStock.length}
              </strong>
            </div>
          </div>
          <div
            className="inventory-alert out-stock-alert"
          >
            <span>
              🚫
            </span>
            <div>
              <p>
                Out of Stock
              </p>
              <strong>
                {outOfStock.length}
              </strong>
            </div>
          </div>
          <div
            className="inventory-alert total-stock-alert"
          >
            <span>
              📦
            </span>
            <div>
              <p>
                Total Products
              </p>
              <strong>
                {inventory.length}
              </strong>
            </div>
          </div>
        </div>
        {/* INVENTORY TABLE */}
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>
                  Product
                </th>
                <th>
                  Category
                </th>
                <th>
                  Price
                </th>
                <th>
                  Stock
                </th>
                <th>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(
                (product) => {
                  let status =
                    "In Stock";
                  if (
                    product.stock === 0
                  ) {
                    status =
                      "Out of Stock";
                  } else if (
                    product.stock <= 10
                  ) {
                    status =
                      "Low Stock";
                  }
                  return (
                    <tr
                      key={product.id}
                    >
                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>
                      <td>
                        {product.category ||
                          "Uncategorized"}
                      </td>
                      <td>
                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}
                      </td>
                      <td>
                        <strong>
                          {product.stock}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`inventory-status ${
                            product.stock === 0
                              ? "inventory-out"
                              : product.stock <= 10
                              ? "inventory-low"
                              : "inventory-good"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                     <td>
  <div className="product-action-buttons">
    <button
      type="button"
      className="edit-product-button"
      onClick={() => {
        // Use the full product record where available because the
        // inventory analytics response may contain only summary fields.
        const selectedProduct =
          products.find(
            (item) => Number(item.id) === Number(product.id)
          ) || product;

        setEditingProductId(selectedProduct.id);
        setProductForm({
          category_id: selectedProduct.category_id ?? "",
          name: selectedProduct.name ?? "",
          description: selectedProduct.description ?? "",
          price: selectedProduct.price ?? "",
          discount: selectedProduct.discount ?? "0",
          stock: selectedProduct.stock ?? "",
          image_url: selectedProduct.image_url ?? ""
        });

        // The product form lives in the Products section.
        setActiveSection("products");
        setShowProductForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Edit
    </button>
    <button
      type="button"
      className="delete-product-button"
      onClick={() =>
        handleDeleteProduct(product.id)
      }
    >
      Delete
    </button>
  </div>
</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* ==========================================
    CATEGORY MANAGEMENT
\========================================== */}
<div className="table-section" data-section="categories">
  <div className="table-header">
    <div>
      <p className="dashboard-label">
        CATEGORIES
      </p>
      <h2>
        Category Management
      </h2>
      <p>
        Manage product categories and descriptions.
      </p>
    </div>
    <button
      type="button"
      className="add-product-button"
      onClick={() => {
        setEditingCategoryId(null);
        setCategoryForm({
          name: "",
          description: ""
        });
        setShowCategoryForm(
          !showCategoryForm
        );
      }}
    >
      {showCategoryForm
        ? "Close Form"
        : "+ Add Category"}
    </button>
  </div>
  {/* CATEGORY FORM */}
  {showCategoryForm && (
    <div className="product-form">
      <div className="product-form-grid">
        {/* CATEGORY NAME */}
        <div className="form-group">
          <label>
            Category Name
          </label>
          <input
            type="text"
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({
                ...categoryForm,
                name: e.target.value
              })
            }
            placeholder="Example: Electronics"
          />
        </div>
        {/* DESCRIPTION */}
        <div className="form-group">
          <label>
            Description
          </label>
          <input
            type="text"
            value={
              categoryForm.description
            }
            onChange={(e) =>
              setCategoryForm({
                ...categoryForm,
                description:
                  e.target.value
              })
            }
            placeholder="Enter category description"
          />
        </div>
      </div>
      {/* FORM BUTTONS */}
      <div className="product-form-actions">
        <button
          type="button"
          className="cancel-product-button"
          onClick={() => {
            setShowCategoryForm(false);
            setEditingCategoryId(null);
            setCategoryForm({
              name: "",
              description: ""
            });
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="save-product-button"
          onClick={
            editingCategoryId
              ? handleUpdateCategory
              : handleCreateCategory
          }
        >
          {editingCategoryId
            ? "Update Category"
            : "Save Category"}
        </button>
      </div>
    </div>
  )}
  {/* CATEGORY TABLE */}
  <div className="table-wrapper">
    <table className="analytics-table">
      <thead>
        <tr>
          <th>
            ID
          </th>
          <th>
            Category
          </th>
          <th>
            Description
          </th>
          <th>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.length > 0 ? (
          categories.map(
            (category) => (
              <tr
                key={category.id}
              >
                <td>
                  {category.id}
                </td>
                <td>
                  <strong>
                    {category.name}
                  </strong>
                </td>
                <td>
                  {category.description ||
                    "No description"}
                </td>
                <td>
                  <div className="product-action-buttons">
                    {/* EDIT */}
                    <button
                      type="button"
                      className="edit-product-button"
                      onClick={() => {
                        setEditingCategoryId(
                          category.id
                        );
                        setCategoryForm({
                          name:
                            category.name,
                          description:
                            category.description ||
                            ""
                        });
                        setShowCategoryForm(
                          true
                        );
                      }}
                    >
                      Edit
                    </button>
                    {/* DELETE */}
                    <button
                      type="button"
                      className="delete-product-button"
                      onClick={() =>
                        handleDeleteCategory(
                          category.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          )
        ) : (
          <tr>
            <td
              colSpan="4"
              style={{
                textAlign: "center",
                padding: "30px"
              }}
            >
              No categories found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
<div className="product-search-bar" data-section="products">
  <input
    type="text"
    placeholder="Search products..."
    value={productSearch}
    onChange={(e) => {
      setProductSearch(e.target.value);
      loadProducts(1, e.target.value);
    }}
  />
</div>
      {/* ======================================
          PRODUCT MANAGEMENT
      ====================================== */}
      <div className="table-section" data-section="products">
        <div className="table-header">
          <div>
            <p className="dashboard-label">
              PRODUCTS
            </p>
            <h2>
              Product Management
            </h2>
            <p>
              Manage products, pricing,
              stock and availability.
            </p>
          </div>
<div className="product-filters">
  <div className="filter-group">
    <label>
      Search
    </label>
    <input
      type="text"
      placeholder="Search products..."
      value={productSearch}
      onChange={(e) => {
        const value = e.target.value;
        setProductSearch(value);
        loadProducts(
          1,
          value,
          productCategory,
          productStock,
          productSort
        );
      }}
    />
  </div>
  <div className="filter-group">
    <label>
      Category
    </label>
    <select
      value={productCategory}
      onChange={(e) => {
        const value = e.target.value;
        setProductCategory(value);
        loadProducts(
          1,
          productSearch,
          value,
          productStock,
          productSort
        );
      }}
    >
      <option value="">
        All Categories
      </option>
      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>
  </div>
  <div className="filter-group">
    <label>
      Stock
    </label>
    <select
      value={productStock}
      onChange={(e) => {
        const value = e.target.value;
        setProductStock(value);
        loadProducts(
          1,
          productSearch,
          productCategory,
          value,
          productSort
        );
      }}
    >
      <option value="">
        All Stock
      </option>
      <option value="in">
        In Stock
      </option>
      <option value="low">
        Low Stock
      </option>
      <option value="out">
        Out of Stock
      </option>
    </select>
  </div>
  <div className="filter-group">
    <label>
      Sort
    </label>
    <select
      value={productSort}
      onChange={(e) => {
        const value = e.target.value;
        setProductSort(value);
        loadProducts(
          1,
          productSearch,
          productCategory,
          productStock,
          value
        );
      }}
    >
      <option value="newest">
        Newest
      </option>
      <option value="name_asc">
        Name A-Z
      </option>
      <option value="price_asc">
        Price Low → High
      </option>
      <option value="price_desc">
        Price High → Low
      </option>
      <option value="stock_asc">
        Stock Low → High
      </option>
    </select>
  </div>
</div>
<div className="pagination-controls">
  <button
    type="button"
    disabled={productPage === 1}
    onClick={() =>
      loadProducts(
        productPage - 1,
        productSearch,
        productCategory,
  productStock,
  productSort
      )
    }
  >
    Previous
  </button>
  <span>
    Page {productPage} of {productTotalPages}
  </span>
  <button
    type="button"
    disabled={
      productPage >= productTotalPages
    }
    onClick={() =>
      loadProducts(
        productPage + 1,
        productSearch,
        productCategory,
  productStock,
  productSort
      )
    }
  >
    Next
  </button>
</div>
          {/* ADD PRODUCT BUTTON */}
          <button
            type="button"
            className="add-product-button"
            onClick={() => {
              if (showProductForm) {
                setShowProductForm(false);
                resetProductForm();
              } else {
                resetProductForm();
                setShowProductForm(true);
              }
            }}
          >
            {showProductForm
              ? "Close Form"
              : "+ Add Product"}
          </button>
        </div>
        {/* ======================================
            ADD PRODUCT FORM
        ====================================== */}
        {showProductForm && (
          <div className="product-form">
            <div className="product-form-grid">
              {/* PRODUCT NAME */}
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      name: e.target.value
                    })
                  }
                  placeholder="Enter product name"
                />
              </div>
              {/* CATEGORY */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      category_id: e.target.value
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* PRICE */}
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: e.target.value
                    })
                  }
                  placeholder="Example: 4999"
                  min="0"
                  step="0.01"
                />
              </div>
              {/* DISCOUNT */}
              <div className="form-group">
                <label>Discount (%)</label>
                <input
                  type="number"
                  value={productForm.discount}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      discount: e.target.value
                    })
                  }
                  placeholder="Example: 10"
                  min="0"
                  max="100"
                />
              </div>
              {/* STOCK */}
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      stock: e.target.value
                    })
                  }
                  placeholder="Example: 50"
                  min="0"
                />
              </div>
              {/* PRODUCT IMAGE */}
              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <small>
                  {uploadingImage
                    ? "Uploading image..."
                    : selectedImageName
                    ? `Selected: ${selectedImageName}`
                    : "JPG, JPEG, PNG or WEBP — maximum 5 MB"}
                </small>
                {productForm.image_url && (
                  <div
                    className="product-image-preview"
                    style={{
                      marginTop: "12px",
                      width: "180px",
                      height: "140px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#f9fafb"
                    }}
                  >
                    <img
                      src={productForm.image_url}
                      alt="Product preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                      </div>
                )}
                {productForm.image_url && (
                  <small>
                    Image uploaded successfully.
                  </small>
                )}
              </div>
              {/* DESCRIPTION */}
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value
                    })
                  }
                  placeholder="Enter product description"
                  rows="4"
                />
              </div>
            </div>
            <div className="product-form-actions">
              <button
                type="button"
                className="cancel-product-button"
                onClick={() => {
                  setShowProductForm(false);
                  resetProductForm();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-product-button"
                onClick={
                  editingProductId
                    ? handleUpdateProduct
                    : handleCreateProduct
                }
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Uploading Image..."
                  : editingProductId
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </div>
          </div>
        )}
{/* ======================================
            PRODUCT TABLE
        ====================================== */}
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>
                  Product
                </th>
                <th>
                  Category
                </th>
                <th>
                  Price
                </th>
                <th>
                  Discount
                </th>
                <th>
                  Stock
                </th>
                <th>
                  Status
                </th>
                <th>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(
                  (product) => (
                    <tr
                      key={product.id}
                    >
                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>
                      <td>
                        {product.category_name ||
                          "Uncategorized"}
                      </td>
                      <td>
                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}
                      </td>
                      <td>
                        {Number(
                          product.discount || 0
                        )}
                        %
                      </td>
                      <td>
                        {product.stock}
                      </td>
                      <td>
                        <span
                          className={`inventory-status ${
                            product.is_active
                              ? "inventory-good"
                              : "inventory-out"
                          }`}
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="product-action-buttons">
                          <button
                            type="button"
                            className="edit-product-button"
                            onClick={() => {
                              setEditingProductId(product.id);
                              setProductForm({
                                category_id: product.category_id || "",
                                name: product.name || "",
                                description: product.description || "",
                                price: product.price || "",
                                discount: product.discount ?? "0",
                                stock: product.stock ?? "",
                                image_url: product.image_url || ""
                              });
                              setShowProductForm(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-product-button"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px"
                    }}
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* ======================================
          ORDER OVERVIEW
      ====================================== */}
      <div className="order-section" data-section="dashboard">
        <h2>
          Order Overview
        </h2>
        <div className="order-grid">
          <div className="order-card pending">
            <span>
              ⏳
            </span>
            <p>
              Pending
            </p>
            <strong>
              {analytics.pending_orders}
            </strong>
          </div>
          <div className="order-card processing">
            <span>
              🔄
            </span>
            <p>
              Processing
            </p>
            <strong>
              {analytics.processing_orders}
            </strong>
          </div>
          <div className="order-card delivered">
            <span>
              🚚
            </span>
            <p>
              Delivered
            </p>
            <strong>
              {analytics.delivered_orders}
            </strong>
          </div>
          <div className="order-card cancelled">
            <span>
              ❌
            </span>
            <p>
              Cancelled
            </p>
            <strong>
              {analytics.cancelled_orders}
            </strong>
          </div>
        </div>
      </div>
      </div>
    </main>
  </div>
  );
}
export default AdminDashboard;

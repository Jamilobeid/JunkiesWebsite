import { useEffect, useState } from 'react'
import './styles.css'

const API_URL = 'http://localhost:5002/api'

const categoryImages = {
  Appetizers: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80',
  Platters: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=900&q=80',
  Drinks: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
  'Beef Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  'Broasted Chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80',
  'Chicken Burgers': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  'Cheese Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  'Chicken Wraps': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80',
  Desserts: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  Extras: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80',
}

function getMenuImage(item) {
  return categoryImages[item.category] || categoryImages['Beef Burgers']
}

function formatPrice(value) {
  if (!value) return 'Coming soon'
  return `${Number(value).toLocaleString('en-US')} L.L.`
}

function App() {
  const [page, setPage] = useState('home')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('junkies_cart') || '[]'))
  const [token, setToken] = useState(() => localStorage.getItem('junkies_token') || '')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load the menu.')
        return response.json()
      })
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    localStorage.setItem('junkies_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('junkies_token')
        setToken('')
      })
  }, [token])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const navigate = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (item) => {
    if (!item.price) return
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...current, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id) => setCart((current) => current.filter((item) => item.id !== id))

  const handleAuth = (authData) => {
    localStorage.setItem('junkies_token', authData.token)
    setToken(authData.token)
    setUser(authData.user)
    navigate('profile')
  }

  const logout = async () => {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    localStorage.removeItem('junkies_token')
    setToken('')
    setUser(null)
    navigate('home')
  }

  const refreshProfile = async () => {
    if (!token) return
    const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (response.ok) setUser(await response.json())
  }

  return (
    <div>
      <Header page={page} navigate={navigate} cartCount={cartCount} user={user} logout={logout} />
      {page === 'home' && <Home navigate={navigate} />}
      {page === 'menu' && (
        <Menu categories={categories} loading={loading} error={error} addToCart={addToCart} />
      )}
      {page === 'cart' && (
        <Cart
          cart={cart}
          total={cartTotal}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          navigate={navigate}
        />
      )}
      {page === 'checkout' && (
        <Checkout
          cart={cart}
          total={cartTotal}
          token={token}
          user={user}
          setCart={setCart}
          navigate={navigate}
          refreshProfile={refreshProfile}
        />
      )}
      {page === 'auth' && <Auth onAuth={handleAuth} />}
      {page === 'profile' && <Profile user={user} token={token} navigate={navigate} />}
      <Footer />
    </div>
  )
}

function Header({ page, navigate, cartCount, user, logout }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate('home')} type="button" aria-label="Junkies home">
        <span className="brand-mark">J</span>
        <span>Junkies</span>
      </button>
      <nav>
        {['home', 'menu', 'cart'].map((item) => (
          <button className={page === item ? 'active' : ''} key={item} onClick={() => navigate(item)} type="button">
            {item === 'cart' ? `Cart (${cartCount})` : item}
          </button>
        ))}
        {user ? (
          <>
            <button className={page === 'profile' ? 'active' : ''} onClick={() => navigate('profile')} type="button">
              Profile
            </button>
            <button onClick={logout} type="button">Log out</button>
          </>
        ) : (
          <button className="nav-cta" onClick={() => navigate('auth')} type="button">Log in</button>
        )}
      </nav>
    </header>
  )
}

function Home({ navigate }) {
  const bestSellers = [
    {
      name: 'Junkies BlackBurger',
      text: 'Double beef, black bun, truffle sauce, mushrooms, cheddar, and signature sauce.',
      price: '900,000 L.L.',
      image: categoryImages['Beef Burgers'],
    },
    {
      name: 'Loaded Chicken-Fries',
      text: 'Crispy chicken over golden fries with three sauces.',
      price: '470,000 L.L.',
      image: categoryImages.Appetizers,
    },
    {
      name: 'Crunchy Buffalo',
      text: 'Crunchy chicken with spicy Buffalo, cheddar, iceberg, and Junkies sauce.',
      price: '590,000 L.L.',
      image: categoryImages['Chicken Burgers'],
    },
  ]

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">For the love of junk food</p>
          <h1>Junkies</h1>
          <p className="hero-text">
            Boneless bites, loaded fries, juicy burgers, wraps, broasted chicken, and dessert cups from a menu built for serious cravings.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate('menu')} type="button">View Menu</button>
            <button className="secondary" onClick={() => navigate('checkout')} type="button">Order Now</button>
          </div>
        </div>
        <div className="burger-plate" aria-label="Fast food illustration">
          <div className="burger">
            <span className="bun top"></span>
            <span className="cheese"></span>
            <span className="patty"></span>
            <span className="bun bottom"></span>
          </div>
          <div className="fries">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </section>
      <section className="feature-strip">
        <div><strong>Freshly Stacked</strong><span>Burgers, wraps, platters</span></div>
        <div><strong>Earn Points</strong><span>Registered users earn rewards</span></div>
        <div><strong>Local Delivery</strong><span>Halba and Andaket branches</span></div>
      </section>
      <section className="home-section best-sellers">
        <div className="section-heading">
          <p className="eyebrow">The signature bite</p>
          <h2>Best Sellers</h2>
          <p className="section-lead">Big flavor, messy sauces, crisp edges, and the kind of order people repeat.</p>
        </div>
        <div className="seller-layout">
          <article className="hero-seller">
            <img src={bestSellers[0].image} alt={bestSellers[0].name} />
            <div>
              <p className="eyebrow badge-eyebrow">Customer favorite</p>
              <h3>{bestSellers[0].name}</h3>
              <p>{bestSellers[0].text}</p>
            </div>
          </article>
          <div className="seller-stack">
            {bestSellers.slice(1).map((item) => (
              <article className="seller-card" key={item.name}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                  <strong>{item.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="home-section about-section">
        <div>
          <p className="eyebrow">About Junkies</p>
          <h2>Built for cravings, finished with attitude.</h2>
        </div>
        <p>
          Junkies is a fast-food kitchen for people who like their burgers stacked, their fries loaded, and their sauces bold. Everything is homemade, authentic, and prepared with the kind of care that makes comfort food feel personal. From boneless chicken and broasted plates to beef burgers, wraps, sauces, and dessert cups, the menu is generous, modern, and unmistakably Junkies.
        </p>
      </section>
      <section className="home-section socials-section">
        <div>
          <p className="eyebrow">Stay connected</p>
          <h2>Follow the drops, deals, and new cravings.</h2>
        </div>
        <div className="social-links">
          <a href="https://www.instagram.com/junkiesboneless.lb" target="_blank" rel="noreferrer">
            <SocialIcon type="instagram" />
            <span>Instagram</span>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            <SocialIcon type="facebook" />
            <span>Facebook</span>
          </a>
          <a href="https://www.tiktok.com" target="_blank" rel="noreferrer">
            <SocialIcon type="tiktok" />
            <span>TikTok</span>
          </a>
        </div>
      </section>
    </>
  )
}

function Menu({ categories, loading, error, addToCart }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('All')
  const categoryNames = ['All', ...categories.map((category) => category.name)]

  const visibleCategories = categories
    .filter((category) => selected === 'All' || category.name === selected)
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length)

  return (
    <main className="page-shell">
      <div className="section-heading">
        <h2>Menu</h2>
        <p className="section-lead">Choose your category, search your craving, and build the order exactly how you want it.</p>
      </div>
      <div className="menu-tools">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search burgers, fries, wraps..." />
        <div className="chip-row">
          {categoryNames.map((name) => (
            <button className={selected === name ? 'selected' : ''} key={name} onClick={() => setSelected(name)} type="button">
              {name}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="status">Loading the menu...</p>}
      {error && <p className="status error">{error}</p>}
      <div className="menu-grid">
        {visibleCategories.map((category) => (
          <section className="menu-category" key={category.id}>
            <h3>{category.name}</h3>
            <div className="item-grid">
              {category.items.map((item) => (
                <article className="menu-item" key={item.id}>
                  <img className="menu-photo" src={getMenuImage(item)} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="item-bottom">
                    <strong>{formatPrice(item.price)}</strong>
                    <button onClick={() => addToCart(item)} disabled={!item.price} type="button">Add</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function Cart({ cart, total, updateQuantity, removeItem, navigate }) {
  return (
    <main className="page-shell narrow">
      <div className="section-heading">
        <p className="eyebrow">Almost there</p>
        <h2>Your Cart</h2>
      </div>
      {!cart.length ? (
        <div className="empty-state">
          <p>Your cart is waiting for something crispy.</p>
          <button className="primary" onClick={() => navigate('menu')} type="button">Browse Menu</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatPrice(item.price)}</span>
                </div>
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.id, -1)} type="button">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} type="button">+</button>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button className="ghost" onClick={() => removeItem(item.id)} type="button">Remove</button>
              </div>
            ))}
          </div>
          <div className="total-bar">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
            <button className="primary" onClick={() => navigate('checkout')} type="button">Checkout</button>
          </div>
        </>
      )}
    </main>
  )
}

function Checkout({ cart, total, token, user, setCart, navigate, refreshProfile }) {
  const [form, setForm] = useState({ customerName: user?.fullName || '', phoneNumber: '', deliveryAddress: '', usePoints: false })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitOrder = async (event) => {
    event.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          items: cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      const order = await response.json()
      setCart([])
      await refreshProfile()
      setMessage(`Order #${order.id} submitted. You earned ${order.pointsEarned} points.`)
    } catch (err) {
      setMessage(err.message || 'Could not submit the order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page-shell checkout-layout">
      <form className="checkout-form" onSubmit={submitOrder}>
        <div className="section-heading">
          <p className="eyebrow">Delivery details</p>
          <h2>Checkout</h2>
        </div>
        <input required placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <input required placeholder="Phone number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        <textarea required placeholder="Delivery address" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
        {user ? (
          <label className="points-toggle">
            <input type="checkbox" checked={form.usePoints} onChange={(e) => setForm({ ...form, usePoints: e.target.checked })} />
            Use points when available ({user.pointsBalance} points)
          </label>
        ) : (
          <p className="hint">Log in before checkout to earn and redeem points.</p>
        )}
        <button className="primary" disabled={!cart.length || submitting} type="submit">
          {submitting ? 'Submitting...' : 'Submit Order'}
        </button>
        {message && <p className="status">{message}</p>}
      </form>
      <aside className="summary-panel">
        <h3>Order Summary</h3>
        {cart.length ? cart.map((item) => (
          <div className="summary-row" key={item.id}>
            <span>{item.quantity} x {item.name}</span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        )) : <p>Your cart is empty.</p>}
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <button className="secondary full" onClick={() => navigate('menu')} type="button">Add More Food</button>
      </aside>
    </main>
  )
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    const endpoint = mode === 'login' ? 'login' : 'register'
    const response = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!response.ok) {
      setMessage(await response.text())
      return
    }
    onAuth(await response.json())
  }

  return (
    <main className="page-shell auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-intro">
          <p className="eyebrow">Junkies Club</p>
          <h2>Come hungry. Leave rewarded.</h2>
          <p>Log in to collect points, reorder faster, and keep every craving in one place.</p>
        </div>
        <div className="tabs">
          <button className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')} type="button">Login</button>
          <button className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')} type="button">Register</button>
        </div>
        {mode === 'register' && <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" minLength="6" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="primary" type="submit">{mode === 'login' ? 'Log In' : 'Create Account'}</button>
        {message && <p className="status error">{message}</p>}
      </form>
    </main>
  )
}

function SocialIcon({ type }) {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5"></rect>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="17" cy="7" r="1.2"></circle>
      </svg>
    )
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8.5h2V5h-2.8C10.7 5 9 6.8 9 9.4V12H7v3.4h2V21h3.8v-5.6h2.8l.5-3.4h-3.3V9.8c0-.8.4-1.3 1.2-1.3Z"></path>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 4c.4 2.5 1.8 4 4.5 4.2v3.5c-1.6.1-3.1-.4-4.4-1.2v5.4c0 3.1-2.2 5.1-5.2 5.1-2.8 0-4.9-2-4.9-4.7 0-2.9 2.3-4.9 5.6-4.8v3.6c-1.2-.1-2 .4-2 1.3 0 .8.6 1.3 1.4 1.3 1 0 1.5-.6 1.5-1.8V4h3.5Z"></path>
    </svg>
  )
}

function Profile({ user, token, navigate }) {
  if (!token) {
    return (
      <main className="page-shell narrow empty-state">
        <p>Please log in to see your points and previous orders.</p>
        <button className="primary" onClick={() => navigate('auth')} type="button">Log In</button>
      </main>
    )
  }

  if (!user) return <main className="page-shell"><p className="status">Loading profile...</p></main>

  return (
    <main className="page-shell">
      <div className="profile-hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user.fullName}</h2>
          <p>{user.email}</p>
        </div>
        <div className="points-card">
          <span>Points Balance</span>
          <strong>{user.pointsBalance}</strong>
          <small>100 points = 500,000 L.L. discount</small>
        </div>
      </div>
      <section className="orders-section">
        <h3>Previous Orders</h3>
        {!user.orders?.length && <p className="hint">No orders yet. Your first one can fix that.</p>}
        {user.orders?.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <strong>Order #{order.id}</strong>
              <span>{new Date(order.orderDate).toLocaleString()}</span>
            </div>
            <p>{order.items.map((item) => `${item.quantity}x ${item.itemName}`).join(', ')}</p>
            <div className="summary-row">
              <span>Final price</span>
              <strong>{formatPrice(order.finalPrice)}</strong>
            </div>
            <div className="summary-row">
              <span>Points earned / used</span>
              <strong>{order.pointsEarned} / {order.pointsUsed}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <span className="brand-mark">J</span>
        <div>
          <strong>Junkies Boneless</strong>
          <span>For the love of junk food</span>
        </div>
      </div>
      <div>
        <strong>Branches</strong>
        <span>Halba and Andaket</span>
      </div>
      <div>
        <strong>Call us</strong>
        <span>Halba: +961 81 730 770</span>
        <span>Andaket: +961 81 233 824</span>
      </div>
    </footer>
  )
}

export default App

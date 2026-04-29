import { useLocation, Link } from 'react-router-dom'

const statusColors = {
  pending: 'bg-hay/20 text-bark',
  confirmed: 'bg-sage/20 text-moss',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-moss/10 text-moss',
  cancelled: 'bg-red-100 text-red-700'
}

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-moss mb-6 text-4xl">
          ✓
        </div>
        <h1 className="font-display text-4xl font-semibold text-soil mb-3">Order Confirmed!</h1>
        <p className="text-bark/70 font-body mb-8">
          Your order has been placed and is being prepared by the farm.
          You'll receive updates on its progress.
        </p>

        {order && (
          <div className="bg-white rounded-card p-6 border border-mist text-left mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-body text-bark/50 mb-0.5">Order number</p>
                <p className="font-display font-semibold text-soil">#{String(order.id).padStart(5, '0')}</p>
              </div>
              <span className={`badge ${statusColors[order.status] || statusColors.pending}`}>
                {order.status || 'pending'}
              </span>
            </div>

            {order.delivery_address && (
              <div className="mb-4 pb-4 border-b border-mist">
                <p className="text-xs font-body text-bark/50 mb-1">Delivering to</p>
                <p className="text-sm font-body text-soil">
                  {order.delivery_address.name}, {order.delivery_address.address}, {order.delivery_address.city} {order.delivery_address.postalCode}, {order.delivery_address.country}
                </p>
              </div>
            )}

            {order.items && order.items.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-body text-bark/50 mb-2">Items ordered</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm font-body">
                    <div>
                      <span className="text-soil font-medium">{item.product_name}</span>
                      <span className="text-bark/50"> ×{item.quantity}</span>
                    </div>
                    <span className="text-soil">€{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-mist pt-4 mt-4 flex justify-between font-semibold">
              <span className="font-body text-soil">Total paid</span>
              <span className="font-display text-xl text-soil">€{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/market" className="btn-primary">
            Continue Shopping →
          </Link>
          <Link to="/profile" className="btn-secondary">
            View Order History
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useShopContext } from "../../context/ShopContext";
import Title from "../../components/Title";
import axios from "axios";
import Link from "next/link";
import { handleImageError, PLACEHOLDER_IMAGE } from "../../components/ui/imageFallback";
import { formatPrice } from "../../utils/pricing";

const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

export default function Orders() {
  const { backendUrl, token, currency } = useShopContext();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return null;
      }
      setLoading(true);

      const res = await axios.post(
        backendUrl + "/api/v1/order/userorders",
        {},
        { headers: { token } },
      );
      if (res.data.success) {
        let allOrdersItem = [];
        res.data.data.forEach((order) => {
          order.items.forEach((item) => {
            const copyItem = { ...item };
            copyItem["orderNumber"] = order.orderNumber;
            copyItem["status"] = order.status;
            copyItem["payment"] = order.payment;
            copyItem["paymentMethod"] = order.paymentMethod;
            copyItem["date"] = order.date;
            copyItem["coupon"] = order.coupon;
            copyItem["deliveryCharge"] = order.deliveryCharge;
            allOrdersItem.push(copyItem);
          });
        });
        // Server already returns newest first
        setOrderData(allOrdersItem);
        setLoadError("");
      }
    } catch (error) {
      setLoadError(error.response?.data?.message || "We couldn't load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div>
        {!token ? (
          <p className="py-8 text-gray-500">
            Please <Link href="/login" className="underline font-medium text-stone-900">log in</Link> to see your orders.
          </p>
        ) : loading ? (
          <p className="py-8 text-gray-500">Loading your orders…</p>
        ) : loadError ? (
          <p className="py-8 text-red-700">{loadError}</p>
        ) : orderData.length === 0 ? (
          <p className="py-8 text-gray-500">
            You haven't placed any orders yet. <Link href="/collection" className="underline font-medium text-stone-900">Start shopping</Link>
          </p>
        ) : (
          orderData.map((item, index) => {
            const rawImg = Array.isArray(item.image) ? item.image[0] : item.image;
            const imgSrc = getImageSrc(rawImg) || PLACEHOLDER_IMAGE;
            const unitPrice = item.priceAtTimeOfPurchase ?? item.price;
            const isCod = !item.paymentMethod || item.paymentMethod === "COD";

            return (
              <div
                className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                key={`${item.orderNumber || ""}-${index}`}
              >
                <div className="flex items-start gap-6 text-sm">
                  <img onError={handleImageError} className="w-16 sm:w-20 object-cover" src={imgSrc} alt={item.name} />
                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                      <p>{unitPrice !== undefined ? formatPrice(unitPrice, currency) : "—"}</p>
                      <p>Quantity: {item.quantity}</p>
                      {item.size && item.size !== "Standard" && <p>Option: {item.size}</p>}
                    </div>
                    <p className="mt-2">
                      Date:{" "}
                      <span className="text-gray-400">
                        {new Date(item.date).toDateString()}
                      </span>
                    </p>
                    <p className="mt-2 text-xs">
                      Payment:{" "}
                      <span className="font-medium text-gray-700">{item.paymentMethod || 'COD'}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[11px] font-semibold ${item.payment ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {item.payment ? 'Paid' : isCod ? 'Pay on delivery' : 'Payment pending'}
                      </span>
                    </p>
                    {item.coupon && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Coupon {item.coupon} (Free Delivery)
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2 flex items-center gap-4 md:justify-between">
                  <div className="flex items-center gap-2">
                    <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                    <p className="text-sm md:text-base">{item.status}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadOrderData}
                    className="luxury-btn-secondary px-6 py-2.5 text-xs"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

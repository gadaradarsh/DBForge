import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import SmartNavbar from "../Navbar/SmartNavbar";
import { useAuth } from "../../context/AuthContext";
import "./Checkout.css"
import image from "./../images/food.webp"

export default function Checkout() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const { user, token } = useAuth();
  
  const getData = () => {
    if (!user) return;
    
    const url = `http://localhost:5000/api/cart/${user.id}`;
    const params = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    };
    fetch(url, params)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setData(data);
        // Calculate total
        const cartTotal = data.reduce((sum, item) => {
          return sum + (item.food_id?.food_price || 0) * item.quantity;
        }, 0);
        setTotal(cartTotal);
      })
      .catch(err => {
        console.error('Error fetching cart:', err);
      });
  };
  useEffect(()=>{
    getData()
  },[])

  return (
    <>
      <SmartNavbar />
      <div style={{ height: "100%",backgroundImage:`url(${image})`,backgroundSize:"cover",fontFamily:' "Merriweather", serif'}}>
        <div className="checkout-container">
          <h1 className="h1" >
           <div> Your Food Cart</div>
          </h1>
          <Link className="btn btn-light mx-1" to="/menu" role="button">
            Back to Menu
          </Link>
          <h3 className="h3">
            <i>Checkout your favourite food Added: </i>
          </h3>
          <div className="cart-container">
            
           {data.length === 0 ? (
            <div className="empty-cart">
              <h4>Your cart is empty</h4>
              <p>Add some delicious food items to get started!</p>
              <Link className="btn btn-primary" to="/menu">Browse Menu</Link>
            </div>
          ) : (
            data.map((item, index) => {
              const food = item.food_id;
              return (
                <div key={index} className="fooditem">
                  <div className="foodname">{food?.food_name || 'Unknown Item'}</div>
                  <div>₹{food?.food_price || 0}</div>
                  <div>Qty: {item.quantity}</div>
                  <div>Total: ₹{(food?.food_price || 0) * item.quantity}</div>
                </div>
              );
            })
          )}

      <div className="coupon">
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Have a coupon code"
          aria-label=""
          aria-describedby="basic-addon2"
        />
        <Button variant="outline-primary" id="button-addon2">
          Apply
        </Button>
      </InputGroup>
      </div>
      
      {data.length > 0 && (
        <div className="total-section">
          <h3>Total: ₹{total}</h3>
          <Link
            className="btn btn-primary mx-auto"
            style={{ position: "fixed", left: "650px", top: "740px" }}
            to="/payment"
          >
            Proceed to Payment
          </Link>
        </div>
      )}
          </div>
        </div>
        
      </div>
    </>
  );
}

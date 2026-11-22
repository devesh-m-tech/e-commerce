import React, { useState } from 'react';
import './Refund.css';

const Refund = () => {
    const [isOpen, setIsOpen] = useState(true);

    const policyData = [
        {
            category: "Pure Silk Sarees & Handlooms",
            items: [
                {
                    type: "Kanchipuram Silk, Banarasi, Tussar, Soft Silk, Cotton Silks",
                    window: "No Returns / Exchanges",
                    action: "Strictly Non-Returnable & Non-Exchangeable (Handloom Purity Guarantee)"
                }
            ]
        },
        {
            category: "Bridal Muhurtham Collection",
            items: [
                {
                    type: "Pure Zari Wedding Sarees, Customized Bridal Silks",
                    window: "No Returns / Exchanges",
                    action: "Strictly Non-Returnable & Non-Exchangeable (Untouched Pristine Fabric)"
                }
            ]
        },
        {
            category: "Heirloom Jewellery & Accessories",
            items: [
                {
                    type: "Temple Jewellery, Antique Sets, Jhumkas, Necklaces",
                    window: "No Returns / Exchanges",
                    action: "Strictly Non-Returnable & Non-Exchangeable (Hygiene & Sanctity Standards)"
                }
            ]
        }
    ];

    return (
        <div className={`refund-policy ${isOpen ? 'open' : ''}`}>
            <div className="refund-header" onClick={() => setIsOpen(!isOpen)}>
                <h2>Strict No-Return & No-Exchange Policy</h2>
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
            </div>
            
            <div className="refund-content">
                <div className="policy-intro">
                    <p>At <strong>Shri Deepaalaya Silks</strong>, every handcrafted pure silk saree and heirloom jewellery creation is thoroughly inspected, steamed, and packaged in pristine condition. Because our products are delicate, authentic handloom masterpieces and sacred wedding garments, <strong>we maintain a strict No-Return and No-Exchange policy</strong>.</p>
                    
                    <div className="important-note">
                        <h3>Our Handloom Standards:</h3>
                        <ul>
                            <li>All orders are final sale and are not eligible for returns or exchanges.</li>
                            <li>No size, color, or alternate product swaps are permitted once delivered.</li>
                            <li>Orders may be cancelled exclusively prior to dispatch from our facility.</li>
                        </ul>
                    </div>
                </div>

                <div className="policy-categories">
                    {policyData.map((category, index) => (
                        <div key={index} className="category-section">
                            <h3>{category.category}</h3>
                            <div className="items-grid">
                                {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="policy-item">
                                        <div className="item-type">{item.type}</div>
                                        <div className="item-details">
                                            <span className="window">{item.window}</span>
                                            <span className="action">{item.action}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Refund;

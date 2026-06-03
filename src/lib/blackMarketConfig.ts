// =============================================================================
// CẤU HÌNH CÔNG THỨC GIÁ CHỢ ĐEN
// =============================================================================
// Giá chợ đen = Giá VCB + spread + dao động ngẫu nhiên nhỏ mỗi ngày (±variation)
//
// Chỉnh buySpread / sellSpread để thay đổi mức chênh lệch so với VCB.
// Đơn vị: VND (với JPY/KRW là VND trên mỗi đơn vị ngoại tệ)
//
// Ví dụ USD:
//   buySpread: 200  → Chợ đen mua = VCB mua + 200đ + dao động
//   sellSpread: 300 → Chợ đen bán = VCB bán + 300đ + dao động
//   variation: 50   → Dao động ngẫu nhiên tối đa ±50đ mỗi ngày
// =============================================================================

export interface BMSpreadConfig {
  /** Điểm chênh mua vào so với VCB (VND) */
  buySpread: number;
  /** Điểm chênh bán ra so với VCB (VND) */
  sellSpread: number;
  /** Biên độ dao động tối đa mỗi ngày (VND). Đặt 0 để tắt dao động. */
  variation: number;
}

export const BM_SPREAD_CONFIG: Record<string, BMSpreadConfig> = {
  //       Mua vào  Bán ra   Dao động
  USD: { buySpread: 200,  sellSpread: 300,  variation: 50   },
  EUR: { buySpread: 250,  sellSpread: 400,  variation: 80   },
  JPY: { buySpread: 0.5,  sellSpread: 1.0,  variation: 0.3  },
  KRW: { buySpread: 0.3,  sellSpread: 0.8,  variation: 0.2  },
  CNY: { buySpread: 30,   sellSpread: 60,   variation: 15   },
  GBP: { buySpread: 300,  sellSpread: 500,  variation: 100  },
  AUD: { buySpread: 200,  sellSpread: 350,  variation: 70   },
  SGD: { buySpread: 200,  sellSpread: 350,  variation: 70   },
};

export const BM_CURRENCIES = Object.keys(BM_SPREAD_CONFIG);

export interface BMRate {
  currency: string;
  buy: number | null;
  sell: number | null;
  vcbBuy: number | null;
  vcbSell: number | null;
}

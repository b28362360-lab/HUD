/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Food' | 'Transport' | 'Supplies' | 'Utilities' | 'Travel' | 'Other';

export interface ExtractionResult {
  vendor_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  tax_amount: number | null;
  category: Category;
  confidence_score: number;
}

export interface ReceiptRecord extends ExtractionResult {
  id: string;
  timestamp: number;
  imageUrl: string;
}

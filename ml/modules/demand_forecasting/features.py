# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false, reportUnknownParameterType=false
import pandas as pd
import numpy as np
from typing import Any, cast


def build_daily_series(orders_df: pd.DataFrame) -> pd.DataFrame:
    # orders_df columns: orderId, customerId, productId, quantity, price, deliveryDate
    orders_df['deliveryDate'] = pd.to_datetime(orders_df['deliveryDate'])
    orders_df['quantity'] = orders_df['quantity'].astype(float)
    cast_df = cast(Any, orders_df)
    delivery_series = cast(Any, orders_df['deliveryDate'])
    daily = cast_df.groupby(['productId', delivery_series.dt.date])['quantity'].sum().reset_index()
    daily.rename(columns={'deliveryDate': 'date', 'quantity': 'qty'}, inplace=True)
    daily['date'] = pd.to_datetime(daily['date'])
    return daily


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    date_series = cast(Any, df['date'])
    df['dow'] = date_series.dt.dayofweek
    df['month'] = date_series.dt.month
    # simple seasonal signals
    df['sin_week'] = np.sin(2 * np.pi * df['dow'] / 7)
    df['cos_week'] = np.cos(2 * np.pi * df['dow'] / 7)
    return df


def add_lag_features(df: pd.DataFrame, lags: int = 7) -> pd.DataFrame:
    df = cast(Any, df).sort_values(['productId', 'date']).copy()
    grouped_qty: Any = df.groupby('productId')['qty']
    for L in range(1, lags + 1):
        df[f'qty_lag_{L}'] = grouped_qty.shift(L)
    df = cast(Any, df).dropna()
    return df
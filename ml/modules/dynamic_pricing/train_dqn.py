import os
from typing import TypedDict, List, Tuple, Optional

import random

MODEL_PATH = os.path.join("ml/models", "dynamic_pricing_dqn.pt")

class TrainResult(TypedDict):
    model_path: str
    episodes: int
    steps: int


def _lazy_torch():
    try:
        import torch  # type: ignore
        import torch.nn as nn  # type: ignore
        import torch.optim as optim  # type: ignore
        return torch, nn, optim
    except Exception as e:
        raise RuntimeError("torch not installed; please enable in ml/requirements.txt and install deps") from e


# Simulated environment per spec
class PricingEnv:
    def __init__(self) -> None:
        self.action_space = [-0.10, -0.05, 0.0, 0.05, 0.10]  # price adjustments
        self.state: Optional[Tuple[float, float, float, float, float]] = None

    def reset(self) -> Tuple[float, float, float, float, float]:
        inv = random.uniform(10, 250)
        demand = random.uniform(2.0, 12.0)
        quality = random.choice([1.0, 0.85, 0.7])
        competitor = random.uniform(0.9, 1.1)
        expiry_h = random.uniform(8, 96)
        self.state = (inv, demand, quality, competitor, expiry_h)
        return self.state

    def step(self, action: float, base_price: float, unit_cost: float) -> Tuple[Tuple[float, float, float, float, float], float, bool]:
        assert self.state is not None
        inv, demand, quality, competitor, expiry_h = self.state
        price = max(base_price * (1 + action), unit_cost * 1.15, base_price * 0.70)
        # demand adjustment by price vs competitor
        elasticity = 0.1 * ((base_price * competitor - price) / base_price)
        expected = max(0.0, demand * quality * (1.0 if expiry_h > 48 else (0.7 if expiry_h > 24 else 0.5)))
        sold = min(inv, expected * (1.0 + elasticity))
        revenue = sold * price
        waste_penalty = 0.2 if expiry_h > 48 else (0.5 if expiry_h > 24 else 0.8)
        waste_cost = max(0.0, inv - sold) * unit_cost * waste_penalty
        satisfaction_bonus = 0.05 * revenue if abs(price - base_price * competitor) / base_price < 0.03 else 0.0
        reward = float(revenue - waste_cost + satisfaction_bonus)
        # single-step episode
        done = True
        next_state = self.reset()
        return next_state, reward, done


def train_model(episodes: int = 1000, lr: float = 1e-3, gamma: float = 0.95, replay: bool = True) -> TrainResult:
    torch, nn, optim = _lazy_torch()

    # Build Q-network directly as a Sequential to avoid nested class typing issues
    env = PricingEnv()
    qnet = nn.Sequential(
        nn.Linear(5, 64), nn.ReLU(),
        nn.Linear(64, 64), nn.ReLU(),
        nn.Linear(64, 5),
    )
    opt = optim.Adam(qnet.parameters(), lr=lr)
    memory: List[Tuple[List[float], int, float, List[float], bool]] = []
    max_mem = 5000

    def select_action(state: Tuple[float, float, float, float, float], eps: float) -> int:
        if random.random() < eps:
            return random.randrange(5)
        with torch.no_grad():
            qvals = qnet(torch.tensor(state, dtype=torch.float32))
            return int(torch.argmax(qvals).item())

    steps = 0
    for ep in range(episodes):
        state = env.reset()
        # derive base_price/unit_cost for this episode
        unit_cost = random.uniform(0.8, 4.5)
        grade_factor = random.choice([2.0, 1.6, 1.3])
        base_price = unit_cost * grade_factor
        eps = max(0.05, 1.0 - ep / episodes)
        a_idx = select_action(state, eps)
        action = env.action_space[a_idx]
        next_state, reward, done = env.step(action, base_price=base_price, unit_cost=unit_cost)
        # store
        memory.append((list(state), a_idx, reward, list(next_state), done))
        if len(memory) > max_mem:
            memory.pop(0)
        # learn
        batch = memory if not replay else random.sample(memory, k=min(64, len(memory)))
        if batch:
            s_batch = torch.tensor([b[0] for b in batch], dtype=torch.float32)
            a_batch = torch.tensor([b[1] for b in batch], dtype=torch.int64)
            r_batch = torch.tensor([b[2] for b in batch], dtype=torch.float32)
            ns_batch = torch.tensor([b[3] for b in batch], dtype=torch.float32)
            d_batch = torch.tensor([b[4] for b in batch], dtype=torch.float32)
            qvals = qnet(s_batch)
            q_sa = qvals.gather(1, a_batch.view(-1, 1)).squeeze(1)
            with torch.no_grad():
                next_q = qnet(ns_batch).max(1)[0]
                target = r_batch + gamma * next_q * (1.0 - d_batch)
            loss = nn.functional.mse_loss(q_sa, target)
            opt.zero_grad()
            loss.backward()
            opt.step()
        steps += 1

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    torch.save(qnet.state_dict(), MODEL_PATH)
    return {"model_path": MODEL_PATH, "episodes": episodes, "steps": steps}


if __name__ == "__main__":
    print(train_model())
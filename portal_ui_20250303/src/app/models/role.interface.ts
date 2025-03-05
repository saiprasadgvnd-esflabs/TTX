export interface Role {
  id: number;
  client_id: number;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  time: number;
  execrise_simulated_amount: number;
  client_id: number;
}

export interface Scenario {
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
  description:string;
}
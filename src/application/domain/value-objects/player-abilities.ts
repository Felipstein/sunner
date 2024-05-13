interface PlayerAbilitiesProps {
  invulnerable: boolean;
  flying: boolean;
  allowFlying: boolean;
  creativeMode: boolean;
}

export class PlayerAbilities {
  readonly invulnerable: boolean;
  readonly flying: boolean;
  readonly allowFlying: boolean;
  readonly creativeMode: boolean;

  constructor(props: PlayerAbilitiesProps) {
    this.invulnerable = props.invulnerable;
    this.flying = props.flying;
    this.allowFlying = props.allowFlying;
    this.creativeMode = props.creativeMode;
  }
}

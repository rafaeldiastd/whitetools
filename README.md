## Banco de Dados - Supabase

## Links
- id
- accesskey
- url
- created_at
- title
- training_time
- construction_time
- research_time

## Players
- id
- player_id
- player_name
- player_avatar

## Slots
- id
- link_id
- slot_time
- slot_date
- is_booked
- player_id
- updated_at

## Trigger
Toda vez que eu criar um link novo, ele irá gerar novos 48 horários no Slots, onde slot_time é calculado de 30 em 30 minutos e slot_date é o mesmo do links (training_time, construction_time e research_time) sendo então 144 novos slots 48 para cada. Todos marcados como is_booked false e com um id proprio

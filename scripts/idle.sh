#!/bin/bash

# Имя файла для хранения PID фонового процесса блокировки
PID_FILE="/tmp/ignis_inhibit.pid"

if [ -f "$PID_FILE" ]; then
	# Если файл существует, получаем PID процесса
	PID=$(cat "$PID_FILE")

	# Проверяем, существует ли этот процесс в системе
	if kill -0 "$PID" 2>/dev/null; then
		# Процесс активен — останавливаем его (выключаем блокировку)
		kill "$PID"
		rm "$PID_FILE"
		notify-send "Блокировка снята" "Система снова может уходить в режим ожидания."
		exit 0
	else
		# Файл остался от старой сессии — удаляем его
		rm "$PID_FILE"
	fi
fi

# Если блокировка не была активна — запускаем её в фоне
# sleep infinity заставляет команду работать бесконечно, пока её не убьют
systemd-inhibit --what="idle:sleep" \
	--who="idle" \
	--why="User toggled idler block via UI" \
	--mode="block" \
	sleep infinity &

# Сохраняем PID запущенного фонового процесса systemd-inhibit
echo $! >"$PID_FILE"
notify-send "Блокировка активна" "Система НЕ уйдет в сон или режим ожидания."

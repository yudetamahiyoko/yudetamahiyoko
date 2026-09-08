extends Node2D

# Probe: can this Godot build rasterize a drawn node to a PNG with no window?
# The whole "design in Godot, bake sprites into the web game" pipeline depends
# on it, so it is worth answering before building anything on top.
func _ready() -> void:
	await RenderingServer.frame_post_draw
	var vp := get_viewport()
	var img := vp.get_texture().get_image()
	if img == null:
		print("RESULT: no image (renderer produced nothing)")
	else:
		var path := "res://probe_out.png"
		var err := img.save_png(path)
		print("RESULT: image %dx%d save_err=%d" % [img.get_width(), img.get_height(), err])
	get_tree().quit()

func _draw() -> void:
	draw_circle(Vector2(64, 64), 50, Color(0.88, 0.65, 0.15))
	draw_rect(Rect2(30, 80, 68, 30), Color(0.2, 0.6, 0.35))
